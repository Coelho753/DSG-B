const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token ausente' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await User.findById(payload.id);

    if (!user || !user.ativo) {
      return res.status(401).json({ message: 'Usuário inválido ou inativo' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = authMiddleware;
