const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    currency: { type: String, default: "USD" },
    unitPrice: { type: Number, required: true, min: 0 },
    effectiveFrom: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

const Pricing = mongoose.model("Pricing", pricingSchema);

module.exports = { Pricing };
