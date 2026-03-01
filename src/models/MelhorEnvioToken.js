const mongoose = require("mongoose");

const MelhorEnvioTokenSchema = new mongoose.Schema({
  accessToken: String,
  expiresAt: Date,
});

module.exports = mongoose.model(
  "MelhorEnvioToken",
  MelhorEnvioTokenSchema
);