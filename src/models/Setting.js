const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  conta: {
    nome: String,
    email: String,
    senhaHash: String,
  },
  aparencia: {
    corPrimaria: { type: String, default: '#1d4ed8' },
    corSecundaria: { type: String, default: '#0f172a' },
    logo: String,
    bannerPrincipal: String,
    favicon: String,
  },
  gerais: {
    nomeSite: { type: String, default: 'Marketplace' },
    emailSuporte: String,
    whatsapp: String,
    taxaPadrao: { type: Number, default: 0 },
    moeda: { type: String, default: 'BRL' },
    cadastroPublicoHabilitado: { type: Boolean, default: true },
  },
  atualizadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  atualizadoEm: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Setting', settingSchema);
