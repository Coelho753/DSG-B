const mongoose = require('mongoose');

const variacaoSchema = new mongoose.Schema(
  {
    nome: { type: String, trim: true },
    opcoes: [{ type: String, trim: true }],
  },
  { _id: false }
);

const dimensoesSchema = new mongoose.Schema(
  {
    largura: Number,
    altura: Number,
    comprimento: Number,
  },
  { _id: false }
);

const promocaoSchema = new mongoose.Schema(
  {
    ativa: { type: Boolean, default: false },
    tipo: { type: String, enum: ['percentual', 'fixo'] },
    valor: { type: Number, min: 0 },
    dataInicio: { type: Date },
    dataFim: { type: Date },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  descricao: { type: String, trim: true },
  descricaoDetalhada: { type: String, trim: true },
  preco: { type: Number, required: true, min: 0, index: true },
  precoPromocional: { type: Number, min: 0 },
  estoque: { type: Number, required: true, min: 0 },
  sku: { type: String, trim: true, unique: true, sparse: true, index: true },
  marca: { type: String, trim: true, index: true },
  peso: { type: Number, min: 0 },
  dimensoes: { type: dimensoesSchema, default: {} },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  subcategoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
  imagens: [{ type: String }],
  variacoes: { type: [variacaoSchema], default: [] },
  destaque: { type: Boolean, default: false, index: true },
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  avaliacaoMedia: { type: Number, default: 0 },
  totalAvaliacoes: { type: Number, default: 0 },
  ativo: { type: Boolean, default: true, index: true },
  promocao: { type: promocaoSchema, default: {} },
  criadoEm: { type: Date, default: Date.now, index: true },
  atualizadoEm: { type: Date, default: Date.now },
  totalVendido: { type: Number, default: 0, index: true },
});

productSchema.pre('save', function updateTimestamp(next) {
  this.atualizadoEm = new Date();
  next();
});

module.exports = mongoose.model('Product', productSchema);
