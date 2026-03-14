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

// CORS corrigido (não bloqueia frontend)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 🔹 INICIA CRON
startTrackingCron();


// 🔹 ROTAS DA API

// AUTH
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// PRODUTOS
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/promotions", promotionRoutes);

// CARRINHO
app.use("/api/cart", cartRoutes);
app.use("/api/frete", freteRoutes);

// PEDIDOS
app.use("/api/orders", orderRoutes);

// CHECKOUT
app.use("/api/checkout", checkoutRoutes);

// PAGAMENTOS (PIX / Mercado Pago)
app.use("/api/payments", paymentRoutes);

// WEBHOOK PAGAMENTO
app.use("/api/webhooks", webhookRoutes);

// CUPONS
app.use("/api/coupons", couponRoutes);

// CONTEÚDO DO SITE
app.use("/api/site-content", siteContentRoutes);

// CÓDIGOS DE MEMBROS
app.use("/api/membership-codes", membershipCodeRoutes);

// SIMULADOR
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

    // 🔥 seed conteúdo do site
    seedSiteContent().catch((seedError) => {
      console.error("Falha no seed de site_content:", seedError.message);
    });

    // 🔥 inicia servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });

  })
  .catch(err => {
    console.error("Erro ao conectar no MongoDB:", err);
  });