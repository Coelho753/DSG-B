const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/User");

router.get("/me", authMiddleware, async (req, res) => {
  try {

    const user = await User.findById(req.user.id)
      .select("-password");

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar usuário" });
  }
});


router.put("/me", authMiddleware, async (req, res) => {

  try {

    const { name, email, address } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    if (address) {
      user.address = address;
    }

    await user.save();

    res.json({
      message: "Usuário atualizado",
      user
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Erro ao atualizar usuário"
    });

  }

});

module.exports = router;