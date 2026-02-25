const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Formato de token inválido" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Compatível com id ou _id
    req.user = {
      id: decoded.id || decoded._id
    };

    if (!req.user.id) {
      return res.status(401).json({ message: "Token inválido" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
};