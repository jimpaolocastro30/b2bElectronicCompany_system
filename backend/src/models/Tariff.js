const mongoose = require("mongoose");

const SERVICE_TYPES = ["power", "gas", "water"];
const RATE_TYPES = ["flat", "tiered", "timeOfUse"];

const tariffSchema = new mongoose.Schema(
  {
    serviceType: { type: String, enum: SERVICE_TYPES, required: true },
    name: { type: String, required: true, trim: true },
    currency: { type: String, default: "USD" },
    rateType: { type: String, enum: RATE_TYPES, default: "flat" },
    unitPrice: { type: Number, required: true, min: 0 },
    effectiveFrom: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

tariffSchema.index({ serviceType: 1, name: 1 }, { unique: true });

const Tariff = mongoose.model("Tariff", tariffSchema);

module.exports = { Tariff, SERVICE_TYPES, RATE_TYPES };

