const mongoose = require("mongoose");

const ORDER_STATUSES = ["pending", "approved", "fulfilled", "shipped", "cancelled"];

const orderItemSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "pending" },
    items: { type: [orderItemSchema], default: [] },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = { Order, ORDER_STATUSES };
