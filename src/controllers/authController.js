const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body, req.user);
    return res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: { id: user._id, nome: user.nome, email: user.email, role: user.role },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    return res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, nome: user.nome, email: user.email, role: user.role },
    });
  } catch (error) {
    return next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const response = await authService.refresh(req.body.refreshToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
};
