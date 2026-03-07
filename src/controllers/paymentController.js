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
      items
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado"
      });
    }

    if (!user.address) {
      return res.status(400).json({
        message: "Cadastre um endereço antes de finalizar a compra."
      });
    }

    /* CALCULAR FRETE */

    const shippingOptions = await calcularFrete({
      from: { postal_code: process.env.STORE_POSTAL_CODE },
      to: { postal_code: user.address.zipCode },
      products: items
    });

    if (!shippingOptions || shippingOptions.length === 0) {
      return res.status(400).json({
        message: "Não foi possível calcular o frete"
      });
    }

    const selectedShipping = shippingOptions[0];

    /* DATA ESTIMADA */

    const estimatedDate = new Date();
    estimatedDate.setDate(
      estimatedDate.getDate() + selectedShipping.delivery_time
    );

    /* CRIAR PEDIDO (PENDING) */

    const order = await Order.create({
      user: user._id,
      items,
      totalAmount: amount,

      shipping: {
        price: selectedShipping.price,
        delivery_time: selectedShipping.delivery_time,
        company: selectedShipping.company.name
      },

      payment: {
        method: payment_method_id,
        status: "pending"
      },

      address: user.address,
      estimatedDeliveryDate: estimatedDate
    });

    /* PAYLOAD DO MERCADO PAGO */

    const payload = {
      transaction_amount: Number(amount),
      description: "Compra DSG",
      payment_method_id,

      metadata: {
        order_id: order._id.toString()
      },

      payer: {
        email: user.email,
        identification: {
          type: "CPF",
          number: user.cpf
        }
      }
    };

    /* CARTÃO */

    if (payment_method_id !== "pix") {

      payload.token = token;
      payload.issuer_id = issuer_id;
      payload.installments = Number(installments);

    }

    /* CRIAR PAGAMENTO */

    const response = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": uuidv4()
        }
      }
    );

    const data = response.data;

    /* SALVAR PAYMENT ID */

    order.payment.paymentId = data.id;
    order.payment.status = data.status;
    order.payment.status_detail = data.status_detail;

    await order.save();

    /* RESPOSTA PARA FRONT */

    res.json({
      paymentId: data.id,
      status: data.status,

      qr_code: data.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64:
        data.point_of_interaction?.transaction_data?.qr_code_base64
    });

  } catch (error) {

    console.error(
      "🚨 ERRO PAGAMENTO:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Erro ao processar pagamento",
      details: error.response?.data || error.message
    });

  }

};