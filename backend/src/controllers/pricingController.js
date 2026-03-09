const { z } = require("zod");
const { Pricing } = require("../models/Pricing");
const { AuditLog } = require("../models/AuditLog");
const { socketHub } = require("../socketHub");

const upsertSchema = z.object({
  sku: z.string().min(1).max(80),
  currency: z.string().min(3).max(8).optional(),
  unitPrice: z.number().min(0),
});

function pricingController(_env) {
  return {
    list: async (_req, res, next) => {
      try {
        const pricing = await Pricing.find().sort({ updatedAt: -1 }).limit(500);
        res.json({
          pricing: pricing.map((p) => ({
            sku: p.sku,
            currency: p.currency,
            unitPrice: p.unitPrice,
            effectiveFrom: p.effectiveFrom,
            updatedAt: p.updatedAt,
          })),
        });
      } catch (err) {
        next(err);
      }
    },

    upsert: async (req, res, next) => {
      try {
        const body = upsertSchema.parse(req.body);
        const doc = await Pricing.findOneAndUpdate(
          { sku: body.sku },
          {
            $set: {
              currency: body.currency || "USD",
              unitPrice: body.unitPrice,
              effectiveFrom: new Date(),
            },
          },
          { upsert: true, new: true }
        );

        await AuditLog.create({
          actorId: req.user?.id || null,
          action: "pricing.upsert",
          target: body.sku,
          meta: { unitPrice: doc.unitPrice, currency: doc.currency },
        });

        socketHub.emit("pricing:updated", {
          sku: doc.sku,
          currency: doc.currency,
          unitPrice: doc.unitPrice,
          effectiveFrom: doc.effectiveFrom,
        });

        res.status(201).json({ ok: true });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { pricingController };
