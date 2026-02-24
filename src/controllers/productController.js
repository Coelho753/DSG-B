const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar produtos" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar produto" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    const result = await cloudinary.uploader.upload(req.file.path);

    const product = await Product.create({
      name,
      price,
      description,
      category,
      image: result.secure_url,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar produto" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Produto deletado" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar produto" });
  }
};