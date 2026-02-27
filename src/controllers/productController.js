const Product = require("../models/Product");
const Promotion = require("../models/Promotion");
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
GET ALL PRODUCTS (COM PROMOÇÃO)
=====================================
*/
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const today = new Date();

    const promotions = await Promotion.find({
      active: true,
      startDate: { $lte: today },
      endDate: { $gte: today },
    });

    const updatedProducts = products.map((product) => {
      let finalPrice = product.price;
      let appliedPromotion = null;

      const promotion = promotions.find((promo) => {
        const productMatch =
          promo.product &&
          promo.product.toString() === product._id.toString();

        const categoryMatch =
          promo.category &&
          promo.category.toString() ===
            (product.category ? product.category.toString() : null);

        return productMatch || categoryMatch;
      });

      if (promotion) {
        appliedPromotion = promotion;

        if (promotion.type === "percentage") {
          finalPrice =
            product.price - product.price * (promotion.value / 100);
        }

        if (promotion.type === "fixed") {
          finalPrice = product.price - promotion.value;
        }

        if (finalPrice < 0) finalPrice = 0;
      }

      return {
        ...product.toObject(),
        originalPrice: product.price,
        finalPrice,
        promotion: appliedPromotion,
      };
    });

    res.json(updatedProducts);

  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ message: "Erro ao buscar produtos" });
  }
};

/*
=====================================
GET PRODUCT BY ID (COM PROMOÇÃO)
=====================================
*/
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    const today = new Date();

    const promotion = await Promotion.findOne({
      active: true,
      startDate: { $lte: today },
      endDate: { $gte: today },
      $or: [
        { product: product._id },
        { category: product.category },
      ],
    });

    let finalPrice = product.price;

    if (promotion) {
      if (promotion.type === "percentage") {
        finalPrice =
          product.price - product.price * (promotion.value / 100);
      }

      if (promotion.type === "fixed") {
        finalPrice = product.price - promotion.value;
      }

      if (finalPrice < 0) finalPrice = 0;
    }

    res.json({
      ...product.toObject(),
      originalPrice: product.price,
      finalPrice,
      promotion: promotion || null,
    });

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

    if (!name || !price) {
      return res.status(400).json({
        message: "Nome e preço são obrigatórios",
      });
    }

    let imageUrl = "";

    if (req.file) {
      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

      const result = await streamUpload();
      imageUrl = result.secure_url;
    }

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