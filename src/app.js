const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/promotions", require("./routes/promotionRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

module.exports = app;