const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  role: { type: String },
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true, index: true },
  resourceId: { type: String, index: true },
  payload: { type: Object },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
