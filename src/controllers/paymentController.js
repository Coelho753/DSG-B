const axios = require("axios");

exports.createPayment = async (req, res) => {
  try {
    const {
      amount,
      token,
      payment_method_id,
      issuer_id,
      installments,
      email,
    } = req.body;

    let payload = {
      transaction_amount: Number(amount),
      description: "Compra DSG",
      payment_method_id,
      payer: { email },
    };

    // 🔹 CARTÃO
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
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    // 🔹 PIX RETORNA QR CODE
    if (payment_method_id === "pix") {
      return res.json({
        id: data.id,
        status: data.status,
        qr_code: data.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64:
          data.point_of_interaction?.transaction_data?.qr_code_base64,
      });
    }

    // 🔹 CARTÃO
    return res.json({
      id: data.id,
      status: data.status,
      status_detail: data.status_detail,
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Erro ao processar pagamento" });
  }
};