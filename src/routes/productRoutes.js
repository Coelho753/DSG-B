const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const { createProduct, getProducts } = require("../controllers/productController");

const storage = multer.diskStorage({
  destination: "./src/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), createProduct);
router.get("/", getProducts);

module.exports = router;