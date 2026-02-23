/**
 * Utilitário: funções auxiliares compartilhadas por diferentes camadas do backend.
 * Arquivo: src/utils/httpError.js
 */
class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

module.exports = HttpError;
