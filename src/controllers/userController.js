const User = require("../models/User");

const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    );
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
};

module.exports = {
  updateProfile
};