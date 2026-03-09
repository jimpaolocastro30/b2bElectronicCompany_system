const { z } = require("zod");
const { InventoryItem } = require("../models/InventoryItem");
const { Pricing } = require("../models/Pricing");
const { AuditLog } = require("../models/AuditLog");
const { socketHub } = require("../socketHub");

const inventoryPayload = z.object({
  items: z
    .array(
      z.object({
        sku: z.string().min(1).max(80),
        name: z.string().min(1).max(200),
        description: z.string().max(2000).optional(),
        quantityOnHand: z.number().int().min(0),
      })
    )
    .min(1)
    .max(5000),
});

const pricingPayload = z.object({
  items: z
    .array(
      z.object({
        sku: z.string().min(1).max(80),
        currency: z.string().min(3).max(8).optional(),
        unitPrice: z.number().min(0),
      })
    )
    .min(1)
    .max(5000),
});

function erpSyncController(_env) {
  return {
    pushInventory: async (req, res, next) => {
      try {
        const body = inventoryPayload.parse(req.body);

        for (const item of body.items) {
          const doc = await InventoryItem.findOneAndUpdate(
            { sku: item.sku },
            {
              $set: {
                name: item.name,
                description: item.description || "",
                quantityOnHand: item.quantityOnHand,
              },
            },
            { upsert: true, new: true }
          );

          socketHub.emit("inventory:updated", {
            sku: doc.sku,
            quantityOnHand: doc.quantityOnHand,
            reserved: doc.reserved,
            available: doc.available,
            updatedAt: doc.updatedAt,
          });
        }

        await AuditLog.create({
          actorId: null,
          action: "erp_sync.inventory",
          target: "",
          meta: { count: body.items.length },
        });

        res.json({ ok: true, count: body.items.length });
      } catch (err) {
        next(err);
      }
    },

    pushPricing: async (req, res, next) => {
      try {
        const body = pricingPayload.parse(req.body);

        for (const item of body.items) {
          const doc = await Pricing.findOneAndUpdate(
            { sku: item.sku },
            {
              $set: {
                currency: item.currency || "USD",
                unitPrice: item.unitPrice,
                effectiveFrom: new Date(),
              },
            },
            { upsert: true, new: true }
          );

          socketHub.emit("pricing:updated", {
            sku: doc.sku,
            currency: doc.currency,
            unitPrice: doc.unitPrice,
            effectiveFrom: doc.effectiveFrom,
          });
        }

        await AuditLog.create({
          actorId: null,
          action: "erp_sync.pricing",
          target: "",
          meta: { count: body.items.length },
        });

        res.json({ ok: true, count: body.items.length });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { erpSyncController };
