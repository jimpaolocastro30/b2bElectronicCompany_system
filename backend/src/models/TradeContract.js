const mongoose = require("mongoose");

const CONTRACT_STATUSES = ["draft", "active", "expired", "cancelled"];

const tradeContractSchema = new mongoose.Schema(
  {
    counterpartyName: { type: String, required: true, trim: true },
    productType: { type: String, required: true, trim: true }, // e.g. base-load, peak
    volume: { type: Number, required: true }, // e.g. MWh
    price: { type: Number, required: true }, // price per unit
    currency: { type: String, default: "USD" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: CONTRACT_STATUSES, default: "draft" },
  },
  { timestamps: true }
);

const TradeContract = mongoose.model("TradeContract", tradeContractSchema);

module.exports = { TradeContract, CONTRACT_STATUSES };

