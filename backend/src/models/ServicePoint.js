const mongoose = require("mongoose");

const SERVICE_TYPES = ["power", "gas", "water"];

const servicePointSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    serviceType: { type: String, enum: SERVICE_TYPES, required: true },
    accountNumber: { type: String, required: true, trim: true },
    companyName: { type: String, default: "", trim: true },
    location: {
      city: { type: String, default: "", trim: true },
      region: { type: String, default: "", trim: true },
      country: { type: String, default: "", trim: true },
    },
    meterId: { type: String, required: true, trim: true },
    contractId: { type: String, default: "", trim: true },
    isoNodeId: { type: String, default: "", trim: true },
    gridZone: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

servicePointSchema.index({ customerId: 1, serviceType: 1 });
servicePointSchema.index({ meterId: 1 }, { unique: true });

const ServicePoint = mongoose.model("ServicePoint", servicePointSchema);

module.exports = { ServicePoint, SERVICE_TYPES };

