const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });


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

router.post("/", auth, admin, upload.single("image"), createProduct);

router.delete("/:id", auth, admin, deleteProduct);

module.exports = router;