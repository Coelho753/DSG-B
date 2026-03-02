const axios = require("axios");

exports.createPayment = async (req, res) => {
  try {
    const {
      token,
      payment_method_id,
      issuer_id,
      amount,
      installments,
      email,
    } = req.body;

    const response = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      {
        transaction_amount: Number(amount),
        token,
        description: "Compra DSG",
        installments: Number(installments),
        payment_method_id,
        issuer_id,
        payer: {
          email,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      status: response.data.status,
      status_detail: response.data.status_detail,
      id: response.data.id,
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Erro ao processar pagamento" });
  }
};