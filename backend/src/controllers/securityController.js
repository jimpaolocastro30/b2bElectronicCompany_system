const { AnomalyFlag } = require("../models/AnomalyFlag");
const { UsageReading } = require("../models/UsageReading");
const { AuditLog } = require("../models/AuditLog");

function securityController(_env) {
  return {
    listAnomalies: async (req, res, next) => {
      try {
        const type = req.query.type;
        const filter = {};
        if (type) filter.relatedType = type;
        const anomalies = await AnomalyFlag.find(filter)
          .sort({ detectedAt: -1 })
          .limit(200);
        res.json({
          anomalies: anomalies.map((a) => ({
            id: String(a._id),
            relatedType: a.relatedType,
            relatedId: a.relatedId,
            detectedAt: a.detectedAt,
            severity: a.severity,
            description: a.description,
            resolvedAt: a.resolvedAt,
          })),
        });
      } catch (err) {
        next(err);
      }
    },

    /** Admin-triggered anomaly scan stub: usage spikes vs 30-day average; logs to AuditLog. */
    scanAnomalies: async (req, res, next) => {
      try {
        const created = [];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const readings = await UsageReading.find({ timestamp: { $gte: thirtyDaysAgo } });
        const byPoint = new Map();
        for (const r of readings) {
          const id = String(r.servicePointId);
          if (!byPoint.has(id)) byPoint.set(id, []);
          byPoint.get(id).push(r.value);
        }

        for (const [servicePointId, values] of byPoint) {
          if (values.length < 5) continue;
          const avg = values.reduce((s, v) => s + v, 0) / values.length;
          const recent = values.slice(-7);
          const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
          if (recentAvg > avg * 1.5) {
            const flag = await AnomalyFlag.create({
              relatedType: "usage",
              relatedId: servicePointId,
              detectedAt: new Date(),
              severity: "medium",
              description: `Usage spike: recent avg ${recentAvg.toFixed(0)} vs 30-day avg ${avg.toFixed(0)}`,
            });
            created.push(String(flag._id));
          }
        }

        await AuditLog.create({
          actorId: req.user.id,
          action: "security.anomaly_scan",
          target: "",
          meta: { flagsCreated: created.length },
        });

        res.json({ ok: true, flagsCreated: created.length, ids: created });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { securityController };

