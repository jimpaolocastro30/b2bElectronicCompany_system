const mongoose = require("mongoose");

const USAGE_UNITS = ["kWh", "therms", "m3"];
const QUALITY_FLAGS = ["actual", "estimated", "missing"];

const usageReadingSchema = new mongoose.Schema(
  {
    servicePointId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServicePoint",
      required: true,
    },
    timestamp: { type: Date, required: true },
    value: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: USAGE_UNITS, required: true },
    qualityFlag: { type: String, enum: QUALITY_FLAGS, default: "actual" },
  },
  { timestamps: true }
);

usageReadingSchema.index({ servicePointId: 1, timestamp: 1 });

const UsageReading = mongoose.model("UsageReading", usageReadingSchema);

module.exports = { UsageReading, USAGE_UNITS, QUALITY_FLAGS };

