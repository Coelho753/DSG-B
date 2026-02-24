const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", categoryController.getCategories);
router.post("/", authMiddleware, categoryController.createCategory);

module.exports = router;