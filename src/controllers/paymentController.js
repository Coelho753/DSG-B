/**
 * Controller: recebe requisições HTTP, valida entradas básicas e delega regras aos serviços/modelos.
 * Arquivo: src/controllers/paymentController.js
 */
const crypto = require('crypto');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { createPreference, getPayment } = require('../services/mercadoPagoService');
const { calculateShipping } = require('../services/shippingService');
const { calculateFinalPrice, getActivePromotionsMap } = require('../services/pricingService');
const { ok, fail } = require('../utils/apiResponse');

// Extrai assinatura no formato enviado pelo Mercado Pago: "ts=...,v1=...".
const parseSignatureHeader = (signatureHeader = '') => {
  const parts = signatureHeader.split(',').map((part) => part.trim());
  const map = new Map();

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key && value) map.set(key, value);
  }

  return {
    ts: map.get('ts'),
    v1: map.get('v1'),
  };
};

// Valida assinatura HMAC do webhook usando MP_WEBHOOK_SECRET (quando configurado).
const validateWebhookSignature = (req) => {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;

  const signatureHeader = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'];
  const dataId = req.body?.data?.id || req.query['data.id'];

  if (typeof signatureHeader !== 'string' || !requestId || !dataId) return false;

  const { ts, v1 } = parseSignatureHeader(signatureHeader);
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(v1, 'hex');
  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

// POST /api/checkout
// Calcula subtotal com promoção dinâmica, aplica frete e cria preferência MP.
const checkout = async (req, res) => {
  try {
    const items = req.body.items || [];
    if (!Array.isArray(items) || !items.length) {
      return fail(res, 'items é obrigatório', 400);
    }

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((product) => [String(product._id), product]));
    const promotionsMap = await getActivePromotionsMap(productIds);

    const preferenceItems = [];
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(String(item.productId));
      const quantity = Number(item.quantity);

      if (!product || !Number.isInteger(quantity) || quantity < 1) {
        return fail(res, 'Item inválido no checkout', 400);
      }

      if (product.stock !== -1 && product.stock < quantity) {
        return fail(res, `Estoque insuficiente para ${product.name}`, 400);
      }

      const promotion = promotionsMap.get(String(product._id));
      const finalPrice = calculateFinalPrice(product.price, promotion?.discountPercentage || 0);
      const itemSubtotal = Number((finalPrice * quantity).toFixed(2));
      subtotal += itemSubtotal;

      preferenceItems.push({
        title: product.name,
        unit_price: finalPrice,
        quantity,
        picture_url: product.imageUrl,
      });

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity,
        unitPrice: finalPrice,
        subtotal: itemSubtotal,
      });
    }

    const roundedSubtotal = Number(subtotal.toFixed(2));
    const shipping = calculateShipping(roundedSubtotal);
    const total = Number((roundedSubtotal + shipping).toFixed(2));

    const order = await Order.create({
      user: req.user?._id,
      items: orderItems,
      subtotal: roundedSubtotal,
      shipping,
      total,
      shippingAddress: req.body.shippingAddress,
      status: 'pending',
      externalReference: crypto.randomUUID(),
    });

    const preference = await createPreference({
      items: preferenceItems,
      external_reference: order.externalReference,
    });

    return ok(res, {
      checkoutUrl: preference?.init_point,
      subtotal: roundedSubtotal,
      shipping,
      total,
    });
  } catch (error) {
    return fail(res, `Erro ao iniciar checkout: ${error.message}`, 500);
  }
};

// POST /api/webhook/mercadopago
// Confirma pagamento aprovado, marca pedido como pago e atualiza métricas/estoque.
const mercadoPagoWebhook = async (req, res) => {
  try {
    if (!validateWebhookSignature(req)) {
      return fail(res, 'Assinatura inválida', 401);
    }

    const paymentId = req.body?.data?.id || req.query['data.id'];
    if (!paymentId) return ok(res, { received: true });

    const payment = await getPayment(paymentId);
    if (payment.status !== 'approved') {
      return ok(res, { received: true, status: payment.status });
    }

    const externalReference = payment.external_reference;
    const order = await Order.findOne({ externalReference });
    if (!order) return ok(res, { received: true, status: 'order_not_found' });
    if (order.status === 'paid') return ok(res, { received: true, status: 'already_paid' });

    order.status = 'paid';
    order.paymentId = String(payment.id);
    order.paidAt = new Date();
    await order.save();

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      product.soldCount += item.quantity;
      if (product.stock !== -1) {
        product.stock = Math.max(product.stock - item.quantity, 0);
      }

      await product.save();
    }

    return ok(res, { received: true, status: 'processed' });
  } catch (error) {
    // Nunca deixa webhook "quebrar" o serviço; apenas responde erro controlado.
    return fail(res, `Erro no webhook: ${error.message}`, 500);
  }
};


// GET /api/payment/config
// Expõe apenas dados públicos necessários para inicialização do checkout no frontend.
const getPaymentConfig = async (req, res) => {
  try {
    if (!process.env.MP_PUBLIC_KEY) {
      return fail(res, 'MP_PUBLIC_KEY não configurada', 500);
    }

    return ok(res, {
      provider: 'mercadopago',
      publicKey: process.env.MP_PUBLIC_KEY,
      currency: 'BRL',
    });
  } catch (error) {
    return fail(res, `Erro ao carregar configuração de pagamento: ${error.message}`, 500);
  }
};

module.exports = {
  checkout,
  mercadoPagoWebhook,
  getPaymentConfig,
};
