const { z } = require("zod");
const { ServicePoint } = require("../models/ServicePoint");
const { UsageReading } = require("../models/UsageReading");
const { Tariff } = require("../models/Tariff");
const { Bill } = require("../models/Bill");
const { AuditLog } = require("../models/AuditLog");

const servicePointQuerySchema = z.object({
  q: z.string().max(200).optional(),
  serviceType: z.enum(["power", "gas", "water"]).optional(),
  limit: z
    .string()
    .transform((v) => Number(v || "200"))
    .pipe(z.number().int().min(1).max(1000))
    .optional(),
});

const usageIngestSchema = z.object({
  readings: z
    .array(
      z.object({
        servicePointId: z.string().min(1),
        timestamp: z.string().datetime(),
        value: z.number().min(0),
        unit: z.enum(["kWh", "therms", "m3"]),
        qualityFlag: z.enum(["actual", "estimated", "missing"]).optional(),
      })
    )
    .min(1)
    .max(5000),
});

const billingRunSchema = z.object({
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
});

async function generateBillsForPeriod({ periodStart, periodEnd }) {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  const servicePoints = await ServicePoint.find({ isActive: true }).select("_id customerId serviceType");
  if (servicePoints.length === 0) return 0;

  const tariffsByType = new Map();
  const tariffs = await Tariff.find().sort({ effectiveFrom: -1 });
  for (const t of tariffs) {
    if (!tariffsByType.has(t.serviceType)) {
      tariffsByType.set(t.serviceType, t);
    }
  }

  let createdCount = 0;
  for (const sp of servicePoints) {
    const tariff = tariffsByType.get(sp.serviceType);
    if (!tariff) continue;

    const existing = await Bill.findOne({
      customerId: sp.customerId,
      servicePointId: sp._id,
      periodStart: start,
      periodEnd: end,
    });
    if (existing) continue;

    const readings = await UsageReading.find({
      servicePointId: sp._id,
      timestamp: { $gte: start, $lte: end },
    });
    if (readings.length === 0) continue;

    const totalUsage = readings.reduce((sum, r) => sum + r.value, 0);
    const amount = totalUsage * tariff.unitPrice;

    const bill = await Bill.create({
      customerId: sp.customerId,
      servicePointId: sp._id,
      periodStart: start,
      periodEnd: end,
      services: [
        {
          serviceType: sp.serviceType,
          usage: totalUsage,
          unit: readings[0].unit,
          unitPrice: tariff.unitPrice,
          amount,
        },
      ],
      totalAmount: amount,
      currency: tariff.currency || "USD",
      status: "issued",
      issuedAt: new Date(),
    });

    await AuditLog.create({
      actorId: null,
      action: "billing.bill_issued",
      target: String(bill._id),
      meta: {
        serviceType: sp.serviceType,
        totalAmount: amount,
      },
    });

    createdCount += 1;
  }

  return createdCount;
}

function adminController(_env) {
  return {
    listServicePoints: async (req, res, next) => {
      try {
        const query = servicePointQuerySchema.parse(req.query);
        const limit = query.limit || 200;
        const filter = {};
        if (query.serviceType) filter.serviceType = query.serviceType;
        if (query.q) {
          filter.$or = [
            { accountNumber: { $regex: query.q, $options: "i" } },
            { companyName: { $regex: query.q, $options: "i" } },
            { meterId: { $regex: query.q, $options: "i" } },
            { gridZone: { $regex: query.q, $options: "i" } },
          ];
        }
        const docs = await ServicePoint.find(filter)
          .sort({ createdAt: -1 })
          .limit(limit);
        res.json({
          servicePoints: docs.map((sp) => ({
            id: String(sp._id),
            customerId: String(sp.customerId),
            serviceType: sp.serviceType,
            accountNumber: sp.accountNumber,
            companyName: sp.companyName,
            meterId: sp.meterId,
            gridZone: sp.gridZone,
            isoNodeId: sp.isoNodeId,
            isActive: sp.isActive,
            createdAt: sp.createdAt,
          })),
        });
      } catch (err) {
        next(err);
      }
    },

    ingestUsageReadings: async (req, res, next) => {
      try {
        const body = usageIngestSchema.parse(req.body);
        const docs = body.readings.map((r) => ({
          servicePointId: r.servicePointId,
          timestamp: new Date(r.timestamp),
          value: r.value,
          unit: r.unit,
          qualityFlag: r.qualityFlag || "actual",
        }));
        await UsageReading.insertMany(docs, { ordered: false });

        await AuditLog.create({
          actorId: req.user.id,
          action: "usage.ingest",
          target: "",
          meta: { count: docs.length },
        });

        res.status(201).json({ ok: true, count: docs.length });
      } catch (err) {
        next(err);
      }
    },

    runBilling: async (req, res, next) => {
      try {
        const body = billingRunSchema.parse(req.body);
        const createdCount = await generateBillsForPeriod({
          periodStart: body.periodStart,
          periodEnd: body.periodEnd,
        });

        await AuditLog.create({
          actorId: req.user.id,
          action: "billing.run",
          target: "",
          meta: {
            periodStart: body.periodStart,
            periodEnd: body.periodEnd,
            billsCreated: createdCount,
          },
        });

        res.status(201).json({ ok: true, billsCreated: createdCount });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { adminController };

