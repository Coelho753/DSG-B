/**
 * Utilitário: funções auxiliares compartilhadas por diferentes camadas do backend.
 * Arquivo: src/utils/slugify.js
 */
const slugify = (text = '') => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

module.exports = slugify;
