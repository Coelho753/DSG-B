/**
 * Middleware: intercepta o ciclo da requisição para autenticação, validação e tratamento transversal.
 * Arquivo: src/middlewares/errorHandler.js
 */
const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(`[${new Date().toISOString()}]`, err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Erro de validação' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Conflito de unicidade' });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
  });
};

module.exports = errorHandler;
