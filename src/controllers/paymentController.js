const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

exports.createPayment = async (req, res) => {
  try {
    const {
      amount,
      token,
      payment_method_id,
      issuer_id,
      installments,
      email,
      cpf,
    } = req.body;

    let payload = {
      transaction_amount: Number(amount),
      description: "Compra DSG",
      payment_method_id,
      payer: {
        email,
        identification: {
          type: "CPF",
          number: cpf,
        },
      },
    };

    if (payment_method_id !== "pix") {
      payload = {
        ...payload,
        token,
        issuer_id,
        installments: Number(installments),
      };
    }

    const response = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": uuidv4(), // 🔥 CORREÇÃO
        },
      }
    );

    const data = response.data;

    if (payment_method_id === "pix") {
      return res.json({
        id: data.id,
        status: data.status,
        qr_code: data.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64:
          data.point_of_interaction?.transaction_data?.qr_code_base64,
      });
    }

    return res.json({
      id: data.id,
      status: data.status,
      status_detail: data.status_detail,
    });

  } catch (error) {
    console.error("ERRO MERCADO PAGO:", error.response?.data || error.message);

    res.status(500).json({
      message: "Erro ao processar pagamento",
      details: error.response?.data || error.message,
    });
  }
};