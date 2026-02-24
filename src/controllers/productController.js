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

    if (req.file) {
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(req.file.buffer);
        });
      };

      const result = await streamUpload();
      imageUrl = result.secure_url;
    }

    const product = await Product.create({
      name,
      price,
      description,
      category,
      image: imageUrl,
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