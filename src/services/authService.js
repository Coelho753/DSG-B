const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const env = require('../config/env');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

const register = async (payload, requester) => {
  const emailExists = await User.findOne({ email: payload.email });
  if (emailExists) throw new Error('Email já cadastrado');

  let role = 'user';
  if (payload.role) {
    if (!requester || requester.role !== 'admin') {
      throw new Error('Apenas admin pode definir role');
    }
    role = payload.role;
  }

  const senhaHash = await bcrypt.hash(payload.senha, 10);

  const user = await User.create({ ...payload, role, senha: senhaHash });
  return user;
};

const login = async ({ email, senha }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Credenciais inválidas');

  const match = await bcrypt.compare(senha, user.senha);
  if (!match) throw new Error('Credenciais inválidas');

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  const decoded = jwt.decode(refreshToken);
  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: dayjs.unix(decoded.exp).toDate(),
  });

  return { accessToken, refreshToken, user };
};

const refresh = async (token) => {
  const stored = await RefreshToken.findOne({ token }).populate('user');
  if (!stored) throw new Error('Refresh token inválido');

  jwt.verify(token, env.jwtRefreshSecret);

  const accessToken = generateAccessToken({ id: stored.user._id, role: stored.user.role });
  return { accessToken };
};

module.exports = {
  register,
  login,
  refresh,
};
