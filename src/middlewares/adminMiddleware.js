const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Acesso restrito a admin" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Erro ao validar admin" });
  }
};