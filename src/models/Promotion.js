const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true, index: true },
  codigo: { type: String, trim: true, uppercase: true, sparse: true, index: true },
  tipo: { type: String, enum: ['percentual', 'fixo', 'cupom'], required: true, index: true },
  valor: { type: Number, required: true, min: 0 },
  dataInicio: { type: Date, required: true, index: true },
  dataFim: { type: Date, required: true, index: true },
  ativa: { type: Boolean, default: true, index: true },
  aplicavelEm: { type: String, enum: ['produto', 'categoria', 'global'], required: true, index: true },
  produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  criadoEm: { type: Date, default: Date.now },
  atualizadoEm: { type: Date, default: Date.now },
});

promotionSchema.pre('save', function updateTimestamp(next) {
  this.atualizadoEm = new Date();
  next();
});

module.exports = mongoose.model('Promotion', promotionSchema);
