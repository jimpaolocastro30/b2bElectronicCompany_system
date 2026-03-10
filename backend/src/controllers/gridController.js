const { GridStatusSnapshot } = require("../models/GridStatusSnapshot");

function gridController(_env) {
  return {
    listStatus: async (req, res, next) => {
      try {
        const limit = Number(req.query.limit || 100);
        const region = req.query.region;
        const filter = {};
        if (region) filter.region = region;
        const snapshots = await GridStatusSnapshot.find(filter)
          .sort({ timestamp: -1 })
          .limit(Math.min(Math.max(limit, 1), 1000));
        res.json({
          snapshots: snapshots.map((s) => ({
            id: String(s._id),
            timestamp: s.timestamp,
            region: s.region,
            frequency: s.frequency,
            load: s.load,
            renewablesShare: s.renewablesShare,
            alerts: s.alerts,
          })),
        });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { gridController };

