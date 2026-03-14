const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const { calcularFrete } = require("../services/freteService");
const { getActivePromotionsMap, toProductResponse } = require("../services/pricingService");
const { ok, fail } = require("../utils/apiResponse");

/**
 * ========================
 * CRIAR PEDIDO
 * ========================
 */
const createOrder = async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const items = req.body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      return fail(res, "Itens obrigatórios", 400);
    }

    if (!req.user) {
      await session.abortTransaction();
      return fail(res, "Usuário não autenticado", 401);
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      await session.abortTransaction();
      return fail(res, "Usuário não encontrado", 404);
    }

    const shippingAddress = req.body.shippingAddress || user.address;

    if (!shippingAddress?.zipCode) {
      await session.abortTransaction();
      return fail(res, "CEP obrigatório", 400);
    }

    const productIds = items.map(item => item.productId);

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

      const productId = String(item.productId);
      const quantity = Number(item.quantity);

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
        subtotal: itemSubtotal
      });

      if (product.stock !== -1) {
        product.stock -= quantity;
      }

      product.soldCount += quantity;

      await product.save({ session });
    }

    subtotal = Number(subtotal.toFixed(2));

    /**
     * ========================
     * CALCULAR FRETE
     * ========================
     */

    const shippingOptions = await calcularFrete({
      from: {
        postal_code: process.env.STORE_POSTAL_CODE
      },
      to: {
        postal_code: shippingAddress.zipCode
      },
      products: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitary_value: item.unitPrice,
        weight: 0.3,
        width: 15,
        height: 10,
        length: 20
      }))
    });

    if (!shippingOptions || !shippingOptions.length) {
      await session.abortTransaction();
      return fail(res, "Nenhuma opção de frete encontrada", 400);
    }

    const selectedShipping = shippingOptions.sort(
      (a, b) => Number(a.price) - Number(b.price)
    )[0];

    const shipping = Number(selectedShipping.price);

    const total = Number((subtotal + shipping).toFixed(2));

    /**
     * ========================
     * CRIAR PEDIDO
     * ========================
     */

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
      status: "pending"
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return ok(res, order[0], 201);

  } catch (error) {

    await session.abortTransaction();
    session.endSession();

    console.error("Erro ao criar pedido:", error);

    return fail(res, "Erro ao criar pedido", 500);
  }
};


/**
 * ========================
 * BUSCAR PEDIDOS DO USUÁRIO
 * ========================
 */

const getMyOrders = async (req, res) => {

  try {

    const orders = await Order.find({
      user: req.user._id
    })
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });

    return ok(res, orders);

  } catch (error) {

    console.error(error);

    return fail(res, "Erro ao buscar pedidos", 500);
  }
};

module.exports = {
  createOrder,
  getMyOrders
};