/**
 * Model: define o schema/estrutura persistida no MongoDB via Mongoose.
 * Arquivo: src/models/Category.js
 */
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
  icone: { type: String, trim: true },
  ordemExibicao: { type: Number, default: 0, index: true },
  ativo: { type: Boolean, default: true, index: true },
  criadaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  criadaEm: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('Category', categorySchema);
