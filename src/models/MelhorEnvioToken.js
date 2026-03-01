const mongoose = require("mongoose");

const melhorEnvioTokenSchema = new mongoose.Schema({
  accessToken: String,
  refreshToken: String,
  expiresAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("MelhorEnvioToken", melhorEnvioTokenSchema);