require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// ROTAS
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const freteRoutes = require("./routes/freteRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const couponRoutes = require("./routes/couponRoutes");

// JOBS
const startTrackingJob = require("./jobs/trackingJob");
const { startTrackingCron } = require("./jobs/trackingCron");

const app = express();

// 🔹 MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 INICIA CRON
startTrackingCron();

// 🔹 ROTAS DA API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/promotions", promotionRoutes);

app.use("/api/cart", cartRoutes);
app.use("/api/frete", freteRoutes);

app.use("/api/orders", orderRoutes);     // pedidos
app.use("/api/checkout", checkoutRoutes); // criar pedido

app.use("/api/payments", paymentRoutes); // PIX / MercadoPago
app.use("/api/webhooks", webhookRoutes); // webhook pagamento

app.use("/api/coupons", couponRoutes);

// 🔹 ROTAS DE TESTE
app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// 🔹 PORTA
const PORT = process.env.PORT || 5000;

// 🔹 CONEXÃO COM MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {

    console.log("MongoDB conectado");

    // 🔥 inicia job de rastreio
    startTrackingJob();

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  })
  .catch(err => {
    console.error("Erro ao conectar no MongoDB:", err);
  });