const User = require('../models/User');

const getProfile = async (req, res) => {
  const { senha, ...safeUser } = req.user.toObject();
  return res.json(safeUser);
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
  updateUserRole,
};
