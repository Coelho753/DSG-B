const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  number: { type: String, required: true },
  neighborhood: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  complement: String,
});

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    cpf: {
      type: String,
      required: true,
    },

    address: {
      type: addressSchema,
      required: true, // 🔥 obrigatório
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);