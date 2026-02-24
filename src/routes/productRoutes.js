const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");

// Criar produto
router.post("/", authMiddleware, productController.createProduct);

// Listar produtos
router.get("/", productController.getProducts);

// Buscar produto por ID
router.get("/:id", productController.getProductById);

// Atualizar produto
router.put("/:id", authMiddleware, productController.updateProduct);

// Deletar produto
router.delete("/:id", authMiddleware, productController.deleteProduct);

module.exports = router;