const mongoose = require("mongoose");

const BID_STATUSES = ["draft", "submitted", "accepted", "rejected", "cancelled"];

const marketBidSchema = new mongoose.Schema(
  {
    market: { type: String, required: true, trim: true }, // ISO/RTO name
    deliveryDate: { type: Date, required: true },
    hourBlock: { type: String, required: true, trim: true }, // e.g. 1-24 or specific block
    volume: { type: Number, required: true }, // MWh
    price: { type: Number, required: true }, // price per MWh
    currency: { type: String, default: "USD" },
    status: { type: String, enum: BID_STATUSES, default: "draft" },
  },
  { timestamps: true }
);

marketBidSchema.index({ market: 1, deliveryDate: 1 });

const MarketBid = mongoose.model("MarketBid", marketBidSchema);

module.exports = { MarketBid, BID_STATUSES };

