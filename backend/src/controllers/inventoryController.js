const { z } = require("zod");
const { InventoryItem } = require("../models/InventoryItem");
const { AuditLog } = require("../models/AuditLog");
const { socketHub } = require("../socketHub");

const upsertSchema = z.object({
  sku: z.string().min(1).max(80),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  quantityOnHand: z.number().int().min(0),
  reserved: z.number().int().min(0).optional(),
});

function inventoryController(_env) {
  return {
    list: async (_req, res, next) => {
      try {
        const items = await InventoryItem.find().sort({ updatedAt: -1 }).limit(500);
        res.json({
          items: items.map((i) => ({
            id: String(i._id),
            sku: i.sku,
            name: i.name,
            description: i.description,
            quantityOnHand: i.quantityOnHand,
            reserved: i.reserved,
            available: i.available,
            updatedAt: i.updatedAt,
          })),
        });
      } catch (err) {
        next(err);
      }
    },

    upsert: async (req, res, next) => {
      try {
        const body = upsertSchema.parse(req.body);
        const doc = await InventoryItem.findOneAndUpdate(
          { sku: body.sku },
          {
            $set: {
              name: body.name,
              description: body.description || "",
              quantityOnHand: body.quantityOnHand,
              reserved: body.reserved ?? 0,
            },
          },
          { upsert: true, new: true }
        );

        await AuditLog.create({
          actorId: req.user?.id || null,
          action: "inventory.upsert",
          target: body.sku,
        });

        socketHub.emit("inventory:updated", {
          sku: doc.sku,
          quantityOnHand: doc.quantityOnHand,
          reserved: doc.reserved,
          available: doc.available,
          updatedAt: doc.updatedAt,
        });

        res.status(201).json({ item: { sku: doc.sku } });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { inventoryController };
