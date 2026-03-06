const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", categoryController.getCategories);
router.post("/", authMiddleware, async (req, res) => {

  try {

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Nome obrigatório"
      });
    }

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-");

    const category = await Category.create({
      name,
      slug
    });

    res.status(201).json(category);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Erro ao criar categoria"
    });

  }

});
module.exports = router;