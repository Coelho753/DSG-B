const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct
} = require("../controllers/productController");

const auth = require("../middlewares/authMiddleware");
const admin = require("../middlewares/adminMiddleware");

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", auth, admin, createProduct);
router.delete("/:id", auth, admin, deleteProduct);

module.exports = router;