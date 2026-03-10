const mongoose = require("mongoose");

const ANOMALY_TYPES = ["usage", "billing", "access", "trading"];
const SEVERITIES = ["low", "medium", "high", "critical"];

const anomalyFlagSchema = new mongoose.Schema(
  {
    relatedType: { type: String, enum: ANOMALY_TYPES, required: true },
    relatedId: { type: String, required: true }, // generic string so it can point to any collection
    detectedAt: { type: Date, required: true },
    severity: { type: String, enum: SEVERITIES, default: "low" },
    description: { type: String, required: true, trim: true },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

anomalyFlagSchema.index({ relatedType: 1, detectedAt: -1 });

const AnomalyFlag = mongoose.model("AnomalyFlag", anomalyFlagSchema);

module.exports = { AnomalyFlag, ANOMALY_TYPES, SEVERITIES };

