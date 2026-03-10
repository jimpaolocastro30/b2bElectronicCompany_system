const mongoose = require("mongoose");

const gridStatusSnapshotSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
    region: { type: String, required: true, trim: true },
    frequency: { type: Number, default: null }, // Hz
    load: { type: Number, default: null }, // MW
    renewablesShare: { type: Number, default: null }, // percentage 0-100
    alerts: { type: [String], default: [] },
  },
  { timestamps: true }
);

gridStatusSnapshotSchema.index({ region: 1, timestamp: -1 });

const GridStatusSnapshot = mongoose.model(
  "GridStatusSnapshot",
  gridStatusSnapshotSchema
);

module.exports = { GridStatusSnapshot };

