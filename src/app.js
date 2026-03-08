const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ROTAS API

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));

app.use("/api/cart", require("./routes/cartRoutes"));

app.use("/api/orders", require("./routes/orderRoutes"));       // ✅ adicionar

app.use("/api/coupons", require("./routes/couponRoutes"));

app.use("/api/orders", require("./routes/orderRoutes"));

app.use("/api/checkout", require("./routes/checkoutRoutes"));

app.use("/api/payments", require("./routes/paymentRoutes"));

app.use("/api/shipping", require("./routes/shippingRoutes"));

app.use("/api/promotions", require("./routes/promotionRoutes"));

module.exports = app;