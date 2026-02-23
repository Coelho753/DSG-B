/**
 * Service: concentra regras de negócio reutilizáveis e integrações externas.
 * Arquivo: src/services/authService.js
 */
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const env = require('../config/env');
const HttpError = require('../utils/httpError');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

const normalizeAddress = (payload = {}) => {
  if (payload.endereco || payload.address) return payload.endereco || payload.address;

  const fromRoot = {
    rua: payload.rua,
    numero: payload.numero,
    complemento: payload.complemento,
    bairro: payload.bairro,
    cidade: payload.cidade,
    estado: payload.estado,
    cep: payload.cep,
  };

  const hasSomeAddressField = Object.values(fromRoot).some(Boolean);
  return hasSomeAddressField ? fromRoot : undefined;
};

const normalizeRegisterPayload = (payload = {}) => ({
  nome: payload.nome || payload.name || payload.fullName || payload.nomeCompleto || payload.username,
  email: (payload.email || payload.userEmail || '').toLowerCase().trim(),
  senha: payload.senha || payload.password,
  role: payload.role,
  endereco: normalizeAddress(payload),
  idioma: payload.idioma || payload.language,
  tema: payload.tema || payload.theme,
  ativo: payload.ativo,
});

const createUserWithRole = async (payload, role) => {
  const normalized = normalizeRegisterPayload(payload);

  const emailExists = await User.findOne({ email: normalized.email });
  if (emailExists) throw new HttpError(409, 'Email já cadastrado');

  const senhaHash = await bcrypt.hash(normalized.senha, 10);
  const user = await User.create({ ...normalized, role, senha: senhaHash });
  return user;
};

const register = async (payload, requester) => {
  let role = 'user';
  if (payload.role) {
    if (!requester || requester.role !== 'admin') {
      throw new HttpError(403, 'Apenas admin pode definir role');
    }
    role = payload.role;
  }

  return createUserWithRole(payload, role);
};

const bootstrapAdmin = async (payload, bootstrapToken) => {
  if (!env.bootstrapAdminToken) {
    throw new HttpError(403, 'BOOTSTRAP_ADMIN_TOKEN não configurado no servidor');
  }

  if (!bootstrapToken || bootstrapToken !== env.bootstrapAdminToken) {
    throw new HttpError(403, 'Token de bootstrap inválido');
  }

  const adminExists = await User.exists({ role: 'admin' });
  if (adminExists) {
    throw new HttpError(409, 'Já existe um administrador. Use /auth/register/admin com conta admin logada');
  }

  return createUserWithRole(payload, 'admin');
};

const login = async ({ email, userEmail, senha, password }) => {
  const resolvedPassword = senha || password;
  const resolvedEmail = (email || userEmail || '').toLowerCase().trim();

  const user = await User.findOne({ email: resolvedEmail });
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
  bootstrapAdmin,
  login,
  refresh,
};
