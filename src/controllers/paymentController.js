const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Order = require("../models/Order");
const { calcularFrete } = require("../services/freteService");

exports.createPayment = async (req, res) => {
  try {
    const {
      amount,
      token,
      payment_method_id,
      issuer_id,
      installments,
      items,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user.address) {
      return res.status(400).json({
        message: "Cadastre um endereço antes de finalizar a compra.",
      });
    }

    // 🔹 CALCULAR FRETE AUTOMÁTICO
    const shippingOptions = await calcularFrete({
      from: { postal_code: process.env.STORE_POSTAL_CODE },
      to: { postal_code: user.address.zipCode },
      products: items,
    });

    const selectedShipping = shippingOptions[0];

    const payload = {
      transaction_amount: Number(amount),
      description: "Compra DSG",
      payment_method_id,
      payer: {
        email: user.email,
        identification: {
          type: "CPF",
          number: user.cpf,
        },
      },
    };

    if (payment_method_id !== "pix") {
      payload.token = token;
      payload.issuer_id = issuer_id;
      payload.installments = Number(installments);
    }

    const response = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": uuidv4(),
        },
      }
    );

    const data = response.data;

    // 🔹 DATA ESTIMADA
    const estimatedDate = new Date();
    estimatedDate.setDate(
      estimatedDate.getDate() + selectedShipping.delivery_time
    );

    // 🔹 CRIAR PEDIDO
    await Order.create({
      user: user._id,
      items,
      totalAmount: amount,

      shipping: {
        price: selectedShipping.price,
        delivery_time: selectedShipping.delivery_time,
        company: selectedShipping.company.name,
      },

      payment: {
        paymentId: data.id,
        method: payment_method_id,
        status: data.status,
        status_detail: data.status_detail,
      },

      address: user.address,
      estimatedDeliveryDate: estimatedDate,
    });

    return res.json({
      id: data.id,
      status: data.status,
    });

  } catch (error) {
    console.error("ERRO:", error.response?.data || error.message);
    res.status(500).json({
      message: "Erro ao processar pagamento",
      details: error.response?.data || error.message,
    });
  }
};