const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { calcularFrete } = require('../services/freteService');
const { getActivePromotionsMap, toProductResponse } = require('../services/pricingService');
const { ok, fail } = require('../utils/apiResponse');

const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const items = req.body.items || req.body.produtos || [];
    const shippingAddress = req.body.shippingAddress;

    if (!Array.isArray(items) || !items.length) {
      await session.abortTransaction();
      return fail(res, 'Itens obrigatórios', 400);
    }

    if (!shippingAddress?.postalCode) {
      await session.abortTransaction();
      return fail(res, 'CEP obrigatório', 400);
    }

    const productIds = items.map(item => item.productId || item.product);

    const products = await Product.find({
      _id: { $in: productIds }
    }).session(session);

    const productMap = new Map(
      products.map(product => [String(product._id), product])
    );

    const promotionsMap = await getActivePromotionsMap(productIds);

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const productId = String(item.productId || item.product);
      const quantity = Number(item.quantity || item.quantidade || 0);
      const product = productMap.get(productId);

      if (!product || quantity <= 0) {
        await session.abortTransaction();
        return fail(res, `Item inválido: ${productId}`, 400);
      }

      if (product.stock !== -1 && product.stock < quantity) {
        await session.abortTransaction();
        return fail(res, `Estoque insuficiente para ${product.name}`, 400);
      }

      const responseProduct = toProductResponse(
        product,
        promotionsMap.get(productId)
      );

      const itemSubtotal = Number(
        (responseProduct.finalPrice * quantity).toFixed(2)
      );

      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity,
        unitPrice: responseProduct.finalPrice,
        subtotal: itemSubtotal,
      });

      if (product.stock !== -1) {
        product.stock -= quantity;
      }

      product.soldCount += quantity;

      await product.save({ session });
    }

    subtotal = Number(subtotal.toFixed(2));

    const shippingOptions = await calcularFrete({
      from: {
        postal_code: process.env.STORE_POSTAL_CODE,
      },
      to: {
        postal_code: shippingAddress.postalCode,
      },
      products: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitary_value: item.unitPrice,
        weight: 0.3,
        width: 15,
        height: 10,
        length: 20,
      })),
    });

    if (!shippingOptions || !shippingOptions.length) {
      await session.abortTransaction();
      return fail(res, 'Nenhuma opção de frete encontrada', 400);
    }

    const selectedShipping = shippingOptions.sort(
      (a, b) => Number(a.price) - Number(b.price)
    )[0];

    const shipping = Number(selectedShipping.price);
    const total = Number((subtotal + shipping).toFixed(2));

    const order = await Order.create([{
      user: req.user._id,
      items: orderItems,
      subtotal,
      shipping,
      total,
      shippingServiceId: selectedShipping.id,
      shippingCompany: selectedShipping.company?.name,
      shippingEstimatedDays: selectedShipping.delivery_time,
      shippingAddress,
      status: 'pending',
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return ok(res, order[0], 201);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
};

module.exports = {
  createOrder,
};