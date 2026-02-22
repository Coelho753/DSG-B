const bcrypt = require('bcrypt');
const User = require('../models/User');

const normalizeAddress = (body = {}) => {
  if (body.address) return body.address;
  if (body.shippingAddress) return body.shippingAddress;
  if (body.endereco) {
    return {
      street: body.endereco.rua || '',
      number: body.endereco.numero || '',
      city: body.endereco.cidade || '',
      state: body.endereco.estado || '',
      zipCode: body.endereco.cep || '',
      complement: body.endereco.complemento || '',
    };
  }
  return null;
};

const getProfile = async (req, res) => {
  const { senha, ...safeUser } = req.user.toObject();
  return res.json(safeUser);
};

const getUserProfile = async (req, res) => {
  const { senha, ...safeUser } = req.user.toObject();
  return res.json({
    nome: safeUser.nome,
    email: safeUser.email,
    address: safeUser.address || {},
    themePreference: safeUser.themePreference || 'light',
  });
};

const updateUserProfile = async (req, res, next) => {
  try {
    const payload = {};

    const nome = req.body.nome || req.body.name;
    const email = req.body.email || req.body.userEmail;
    const address = normalizeAddress(req.body);
    const themePreference = req.body.themePreference || req.body.tema;
    const senha = req.body.senha || req.body.password || req.body.newPassword;

    if (nome) payload.nome = nome;
    if (email) payload.email = String(email).toLowerCase().trim();
    if (address) payload.address = address;
    if (themePreference) payload.themePreference = themePreference;

    if (senha) {
      if (String(senha).length < 6) {
        return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' });
      }
      payload.senha = await bcrypt.hash(String(senha), 10);
    }

    const user = await User.findByIdAndUpdate(req.user._id, payload, { new: true, runValidators: true });
    const { senha: hiddenPassword, ...safeUser } = user.toObject();
    return res.json({ message: 'Perfil atualizado', user: safeUser });
  } catch (error) {
    return next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    return res.json({ message: 'Role atualizada', user });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProfile,
  getUserProfile,
  updateUserProfile,
  updateUserRole,
};
