const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    quantityOnHand: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

inventoryItemSchema.virtual("available").get(function available() {
  return Math.max(0, (this.quantityOnHand || 0) - (this.reserved || 0));
});

const InventoryItem = mongoose.model("InventoryItem", inventoryItemSchema);

module.exports = { InventoryItem };
