const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

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