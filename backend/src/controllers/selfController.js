const { z } = require("zod");
const { ServicePoint } = require("../models/ServicePoint");
const { UsageReading } = require("../models/UsageReading");
const { Bill } = require("../models/Bill");
const { AuditLog } = require("../models/AuditLog");

const usageQuerySchema = z.object({
  serviceType: z.enum(["power", "gas", "water"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z
    .string()
    .transform((v) => Number(v || "200"))
    .pipe(z.number().int().min(1).max(1000))
    .optional(),
});

const serviceRequestSchema = z.object({
  type: z.string().min(1).max(120),
  description: z.string().min(1).max(4000),
  preferredDate: z.string().datetime().optional(),
});

function selfController(_env) {
  return {
    profile: async (req, res, next) => {
      try {
        const servicePoints = await ServicePoint.find({ customerId: req.user.id }).sort({
          createdAt: -1,
        });
        res.json({
          user: req.user,
          servicePoints: servicePoints.map((sp) => ({
            id: String(sp._id),
            serviceType: sp.serviceType,
            accountNumber: sp.accountNumber,
            companyName: sp.companyName,
            location: sp.location,
            meterId: sp.meterId,
            contractId: sp.contractId,
            isoNodeId: sp.isoNodeId,
            gridZone: sp.gridZone,
            isActive: sp.isActive,
          })),
        });
      } catch (err) {
        next(err);
      }
    },

    usage: async (req, res, next) => {
      try {
        const query = usageQuerySchema.parse(req.query);
        const limit = query.limit || 200;

        const servicePointFilter = { customerId: req.user.id };
        if (query.serviceType) {
          servicePointFilter.serviceType = query.serviceType;
        }
        const servicePoints = await ServicePoint.find(servicePointFilter).select("_id serviceType meterId");
        const servicePointIds = servicePoints.map((sp) => sp._id);
        if (servicePointIds.length === 0) return res.json({ readings: [] });

        const filter = { servicePointId: { $in: servicePointIds } };
        if (query.from) filter.timestamp = { ...filter.timestamp, $gte: new Date(query.from) };
        if (query.to) filter.timestamp = { ...filter.timestamp, $lte: new Date(query.to) };

        const readings = await UsageReading.find(filter)
          .sort({ timestamp: -1 })
          .limit(limit);

        res.json({
          readings: readings.map((r) => ({
            id: String(r._id),
            servicePointId: String(r.servicePointId),
            timestamp: r.timestamp,
            value: r.value,
            unit: r.unit,
            qualityFlag: r.qualityFlag,
          })),
        });
      } catch (err) {
        next(err);
      }
    },

    listBills: async (req, res, next) => {
      try {
        const bills = await Bill.find({ customerId: req.user.id })
          .sort({ periodEnd: -1 })
          .limit(200);
        res.json({
          bills: bills.map((b) => ({
            id: String(b._id),
            periodStart: b.periodStart,
            periodEnd: b.periodEnd,
            totalAmount: b.totalAmount,
            currency: b.currency,
            status: b.status,
            issuedAt: b.issuedAt,
            paidAt: b.paidAt,
          })),
        });
      } catch (err) {
        next(err);
      }
    },

    getBill: async (req, res, next) => {
      try {
        const bill = await Bill.findOne({
          _id: req.params.id,
          customerId: req.user.id,
        });
        if (!bill) return res.status(404).json({ error: "Not found" });
        res.json({
          id: String(bill._id),
          periodStart: bill.periodStart,
          periodEnd: bill.periodEnd,
          services: bill.services,
          totalAmount: bill.totalAmount,
          currency: bill.currency,
          status: bill.status,
          issuedAt: bill.issuedAt,
          paidAt: bill.paidAt,
        });
      } catch (err) {
        next(err);
      }
    },

    createServiceRequest: async (req, res, next) => {
      try {
        const body = serviceRequestSchema.parse(req.body);
        await AuditLog.create({
          actorId: req.user.id,
          action: "portal.service_request",
          target: "",
          meta: {
            type: body.type,
            preferredDate: body.preferredDate || null,
          },
        });
        res.status(201).json({ ok: true });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { selfController };

