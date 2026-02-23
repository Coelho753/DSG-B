/**
 * Middleware: intercepta o ciclo da requisição para autenticação, validação e tratamento transversal.
 * Arquivo: src/middlewares/authMiddleware.js
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) return authHeader.split(' ')[1];
    if (authHeader.startsWith('Token ')) return authHeader.split(' ')[1];
    return authHeader; // fallback para integrações legadas
  }

  const xAccessToken = req.headers['x-access-token'];
  if (xAccessToken) return String(xAccessToken);

  const queryToken = req.query?.token;
  if (queryToken) return String(queryToken);

  return null;
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Token ausente' });
    }

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
