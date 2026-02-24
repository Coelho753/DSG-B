const Category = require("../models/Category");

// Criar
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Categoria já existe" });
    }

    const category = await Category.create({ name });
    res.status(201).json(category);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar categoria" });
  }
};

// Listar
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar categorias" });
  }
};