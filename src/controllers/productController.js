const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

/*
=====================================
GET ALL PRODUCTS
=====================================
*/
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ message: "Erro ao buscar produtos" });
  }
};

/*
=====================================
GET PRODUCT BY ID
=====================================
*/
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    res.json(product);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({ message: "Erro ao buscar produto" });
  }
};

/*
=====================================
CREATE PRODUCT
=====================================
*/
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    let imageUrl = "";

    // Se tiver imagem enviada
    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        async (error, result) => {
          if (error) {
            console.error("Erro no Cloudinary:", error);
            return res.status(500).json({ message: "Erro no upload da imagem" });
          }

          const product = await Product.create({
            name,
            price,
            description,
            category,
            image: result.secure_url,
          });

          return res.status(201).json(product);
        }
      );

      result.end(req.file.buffer);
      return;
    }

    // Se não tiver imagem
    const product = await Product.create({
      name,
      price,
      description,
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ message: "Erro ao criar produto" });
  }
};

/*
=====================================
DELETE PRODUCT
=====================================
*/
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Produto deletado" });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({ message: "Erro ao deletar produto" });
  }
};