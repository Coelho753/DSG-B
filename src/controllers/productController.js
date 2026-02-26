const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

/*
=====================================
FUNÇÃO INTERNA PARA GERAR SLUG
=====================================
*/
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

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
    console.log("BODY:", req.body);
    console.log("FILE:", req.file); 

    const { name, price, description, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        message: "Nome e preço são obrigatórios",
      });
    }

    let imageUrl = "";

    // Upload para Cloudinary se houver imagem
    if (
      req.file &&
      process.env.CLOUDINARY_NAME &&
      process.env.CLOUDINARY_KEY &&
      process.env.CLOUDINARY_SECRET
    ) {
      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(req.file.buffer);
        });

      const result = await streamUpload();
      imageUrl = result.secure_url;
    }

    // 🔥 Geração automática de slug único
    const slug = `${slugify(name)}-${Date.now()}`;

    const product = await Product.create({
      name,
      price,
      description,
      category,
      image: imageUrl,
      slug,
    });

    res.status(201).json(product);

  } catch (error) {
    console.error("Erro detalhado ao criar produto:", error);
    res.status(500).json({
      message: "Erro ao criar produto",
      error: error.message,
    });
  }
};

/*
=====================================
DELETE PRODUCT
=====================================
*/
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Produto não encontrado",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Produto deletado com sucesso" });

  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({ message: "Erro ao deletar produto" });
  }
};