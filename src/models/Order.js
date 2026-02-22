const mongoose = require('mongoose');

const enderecoEntregaSchema = new mongoose.Schema(
  {
    rua: String,
    numero: String,
    complemento: String,
    bairro: String,
    cidade: String,
    estado: String,
    cep: String,
    street: String,
    number: String,
    city: String,
    state: String,
    zipCode: String,
    complement: String,
  },
  { _id: false }
);

const produtoPedidoSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    nome: { type: String },
    quantidade: { type: Number, required: true, min: 1 },
    precoUnitarioFinal: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, min: 0, default: 0 },
    profit: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  produtos: [produtoPedidoSchema],
  items: [produtoPedidoSchema],
  valorTotal: { type: Number, required: true, min: 0 },
  totalPaid: { type: Number, min: 0 },
  profit: { type: Number, min: 0, default: 0 },
  enderecoEntrega: { type: enderecoEntregaSchema, required: true },
  shippingAddress: { type: enderecoEntregaSchema },
  shippingFee: { type: Number, default: 0 },
  paidAt: { type: Date },
  status: {
    type: String,
    enum: ['pendente', 'confirmado', 'enviado', 'cancelado', 'paid'],
    default: 'pendente',
    index: true,
  },
  criadoEm: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('Order', orderSchema);
