const User = require('../models/User');

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
    if (req.body.nome) payload.nome = req.body.nome;
    if (req.body.email) payload.email = req.body.email;
    if (req.body.address) payload.address = req.body.address;
    if (req.body.themePreference) payload.themePreference = req.body.themePreference;

    const user = await User.findByIdAndUpdate(req.user._id, payload, { new: true, runValidators: true });
    const { senha, ...safeUser } = user.toObject();
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
