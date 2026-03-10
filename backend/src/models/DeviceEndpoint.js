const mongoose = require("mongoose");

const PROTOCOLS = ["ModbusTCP", "IEC60870", "DNP3", "EthernetIO"];

const deviceEndpointSchema = new mongoose.Schema(
  {
    servicePointId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServicePoint",
      default: null,
    },
    gridZone: { type: String, default: "", trim: true },
    protocol: { type: String, enum: PROTOCOLS, required: true },
    // Generic connection parameters; interpretation depends on protocol
    host: { type: String, default: "", trim: true },
    port: { type: Number, default: null },
    unitId: { type: Number, default: null }, // e.g. Modbus unit ID
    rtuAddress: { type: String, default: "", trim: true }, // for serial/RTU style
    lastSeenAt: { type: Date, default: null },
    status: { type: String, default: "unknown", trim: true },
  },
  { timestamps: true }
);

deviceEndpointSchema.index({ servicePointId: 1 });
deviceEndpointSchema.index({ gridZone: 1, protocol: 1 });

const DeviceEndpoint = mongoose.model("DeviceEndpoint", deviceEndpointSchema);

module.exports = { DeviceEndpoint, PROTOCOLS };

