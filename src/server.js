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
const siteContentRoutes = require("./routes/siteContentRoutes");
const membershipCodeRoutes = require("./routes/membershipCodeRoutes");
const simulatorRoutes = require("./routes/simulatorRoutes");
const { seedSiteContent } = require("./services/siteContentSeedService");

// JOBS
const startTrackingJob = require("./jobs/trackingJob");
const { startTrackingCron } = require("./jobs/trackingCron");

const app = express();

// 🔹 MIDDLEWARES
const allowedOrigins = [
  "https://id-preview--cd892f8b-190a-4c0f-aa53-b7510ef49ce2.lovable.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
}));
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
app.use("/api/site-content", siteContentRoutes);
app.use("/api/membership-codes", membershipCodeRoutes);
app.use("/api/simulador", simulatorRoutes);

// 🔹 ROTAS DE TESTE
app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// 🔹 PORTA
const PORT = process.env.PORT || 5000;

// 🔹 CONEXÃO COM MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {

    console.log("MongoDB conectado");

    // 🔥 inicia job de rastreio
    startTrackingJob();

    seedSiteContent().catch((seedError) => {
      console.error("Falha no seed de site_content:", seedError.message);
    });

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  })
  .catch(err => {
    console.error("Erro ao conectar no MongoDB:", err);
  });
