const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  ativo: { type: Boolean, default: true, index: true },
  criadaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  criadaEm: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('Category', categorySchema);
