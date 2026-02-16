const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const env = require('../config/env');
const HttpError = require('../utils/httpError');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

const normalizeRegisterPayload = (payload = {}) => ({
  nome: payload.nome || payload.name,
  email: payload.email,
  senha: payload.senha || payload.password,
  role: payload.role,
  endereco: payload.endereco || payload.address,
  idioma: payload.idioma || payload.language,
  tema: payload.tema || payload.theme,
  ativo: payload.ativo,
});

const register = async (payload, requester) => {
  const normalized = normalizeRegisterPayload(payload);

  const emailExists = await User.findOne({ email: normalized.email });
  if (emailExists) throw new HttpError(409, 'Email já cadastrado');

  let role = 'user';
  if (normalized.role) {
    if (!requester || requester.role !== 'admin') {
      throw new HttpError(403, 'Apenas admin pode definir role');
    }
    role = normalized.role;
  }

  const senhaHash = await bcrypt.hash(normalized.senha, 10);

  const user = await User.create({ ...normalized, role, senha: senhaHash });
  return user;
};

const login = async ({ email, senha, password }) => {
  const resolvedPassword = senha || password;
  const user = await User.findOne({ email });
  if (!user) throw new HttpError(401, 'Credenciais inválidas');

  const match = await bcrypt.compare(resolvedPassword, user.senha);
  if (!match) throw new HttpError(401, 'Credenciais inválidas');

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
  if (!stored) throw new HttpError(401, 'Refresh token inválido');

  jwt.verify(token, env.jwtRefreshSecret);

  if (!stored.user || !stored.user.ativo) {
    throw new HttpError(401, 'Usuário inválido para refresh token');
  }

  const accessToken = generateAccessToken({ id: stored.user._id, role: stored.user.role });
  return { accessToken };
};

module.exports = {
  register,
  login,
  refresh,
};
