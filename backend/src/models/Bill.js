const mongoose = require("mongoose");

const BILL_STATUSES = ["draft", "issued", "paid", "overdue"];

const billServiceSchema = new mongoose.Schema(
  {
    serviceType: { type: String, enum: ["power", "gas", "water"], required: true },
    usage: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    servicePointId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServicePoint",
      default: null,
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    services: { type: [billServiceSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: BILL_STATUSES, default: "draft" },
    issuedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

billSchema.index({ customerId: 1, periodStart: 1, periodEnd: 1 });

const Bill = mongoose.model("Bill", billSchema);

module.exports = { Bill, BILL_STATUSES };

