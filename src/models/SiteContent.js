const mongoose = require("mongoose");

const siteContentSchema = new mongoose.Schema(
  {
    section_key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("SiteContent", siteContentSchema);
