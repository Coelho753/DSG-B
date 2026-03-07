require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

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





const startTrackingJob = require("./jobs/trackingJob");

const { startTrackingCron } = require('./jobs/trackingCron');

startTrackingCron();

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 ROTAS
app.use("/api/auth", authRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/frete", freteRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/webhooks", webhookRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 5000;

// 🔹 CONECTA AO BANCO E SÓ DEPOIS INICIA SERVIDOR + JOB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB conectado");

    // 🔥 Inicia o job de rastreio
    startTrackingJob();

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Erro ao conectar no MongoDB:", err);
  });