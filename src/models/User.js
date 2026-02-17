const mongoose = require('mongoose');

const enderecoSchema = new mongoose.Schema(
  {
    rua: { type: String, trim: true },
    numero: { type: String, trim: true },
    complemento: { type: String, trim: true },
    bairro: { type: String, trim: true },
    cidade: { type: String, trim: true },
    estado: { type: String, trim: true },
    cep: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true, index: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  senha: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'admin', 'seller', 'distribuidor', 'revendedor'],
    default: 'user',
    index: true,
  },
  endereco: { type: enderecoSchema, default: {} },
  idioma: { type: String, default: 'pt' },
  tema: { type: String, default: 'light' },
  ativo: { type: Boolean, default: true, index: true },
  criadoEm: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('User', userSchema);
