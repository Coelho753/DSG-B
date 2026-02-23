/**
 * Utilitário: funções auxiliares compartilhadas por diferentes camadas do backend.
 * Arquivo: src/utils/apiResponse.js
 */
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });

module.exports = {
  ok,
  fail,
};
