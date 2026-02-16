const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(`[${new Date().toISOString()}]`, err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Erro de validação', details: err.message });
  }

  return res.status(err.statusCode || 500).json({
    message: err.message || 'Erro interno do servidor',
  });
};

module.exports = errorHandler;
