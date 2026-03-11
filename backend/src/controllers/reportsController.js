const { User } = require("../models/User");
const { ServicePoint } = require("../models/ServicePoint");
const { UsageReading } = require("../models/UsageReading");
const { Bill } = require("../models/Bill");
const { TradeContract } = require("../models/TradeContract");
const { MarketBid } = require("../models/MarketBid");
const { AnomalyFlag } = require("../models/AnomalyFlag");

function reportsController(_env) {
  return {
    clientDashboard: async (req, res, next) => {
      try {
        const customerId = req.user.id;
        const servicePoints = await ServicePoint.find({ customerId });
        const spIds = servicePoints.map((sp) => sp._id);

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

        const [bills, recentUsage, prevUsage] = await Promise.all([
          Bill.find({ customerId }).sort({ periodEnd: -1 }).limit(100),
          UsageReading.aggregate([
            { $match: { servicePointId: { $in: spIds }, timestamp: { $gte: thirtyDaysAgo } } },
            { $group: { _id: "$unit", total: { $sum: "$value" }, count: { $sum: 1 } } },
          ]),
          UsageReading.aggregate([
            { $match: { servicePointId: { $in: spIds }, timestamp: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
            { $group: { _id: null, total: { $sum: "$value" } } },
          ]),
        ]);

        const totalBilled = bills.reduce((s, b) => s + b.totalAmount, 0);
        const totalPaid = bills.filter((b) => b.status === "paid").reduce((s, b) => s + b.totalAmount, 0);
        const outstanding = bills.filter((b) => ["issued", "overdue"].includes(b.status)).reduce((s, b) => s + b.totalAmount, 0);
        const overdueBills = bills.filter((b) => b.status === "overdue").length;
        const currentUsage = recentUsage.reduce((s, r) => s + r.total, 0);
        const previousUsage = prevUsage[0]?.total || 0;
        const usageTrend = previousUsage > 0 ? Math.round(((currentUsage - previousUsage) / previousUsage) * 100) : 0;

        const usageByType = await UsageReading.aggregate([
          { $match: { servicePointId: { $in: spIds }, timestamp: { $gte: thirtyDaysAgo } } },
          {
            $lookup: {
              from: "servicepoints",
              localField: "servicePointId",
              foreignField: "_id",
              as: "sp",
            },
          },
          { $unwind: "$sp" },
          { $group: { _id: "$sp.serviceType", total: { $sum: "$value" }, unit: { $first: "$unit" } } },
        ]);

        const usageDaily = await UsageReading.aggregate([
          { $match: { servicePointId: { $in: spIds }, timestamp: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
              total: { $sum: "$value" },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        const billsByMonth = await Bill.aggregate([
          { $match: { customerId: servicePoints[0]?.customerId || null } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$periodEnd" } },
              total: { $sum: "$totalAmount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $limit: 12 },
        ]);

        const byService = {};
        servicePoints.forEach((sp) => {
          byService[sp.serviceType] = (byService[sp.serviceType] || 0) + 1;
        });

        res.json({
          kpis: {
            servicePoints: servicePoints.length,
            activePoints: servicePoints.filter((sp) => sp.isActive).length,
            totalBilled: Math.round(totalBilled * 100) / 100,
            totalPaid: Math.round(totalPaid * 100) / 100,
            outstanding: Math.round(outstanding * 100) / 100,
            overdueBills,
            currentUsage: Math.round(currentUsage * 100) / 100,
            usageTrend,
          },
          servicePointsByType: byService,
          usageByType: usageByType.map((u) => ({ type: u._id, total: Math.round(u.total * 100) / 100, unit: u.unit })),
          usageDaily: usageDaily.map((d) => ({ date: d._id, value: Math.round(d.total * 100) / 100 })),
          billsByMonth: billsByMonth.map((b) => ({ month: b._id, total: Math.round(b.total * 100) / 100, count: b.count })),
          recentBills: bills.slice(0, 5).map((b) => ({
            id: String(b._id),
            periodStart: b.periodStart,
            periodEnd: b.periodEnd,
            totalAmount: b.totalAmount,
            currency: b.currency,
            status: b.status,
          })),
        });
      } catch (err) {
        next(err);
      }
    },

    adminDashboard: async (req, res, next) => {
      try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

        const [
          totalCustomers,
          totalServicePoints,
          activeServicePoints,
          totalBills,
          revenueAgg,
          outstandingAgg,
          anomalyCount,
          unresolvedAnomalies,
          contractCount,
          activeContracts,
          bidCount,
          acceptedBids,
        ] = await Promise.all([
          User.countDocuments({ role: "client" }),
          ServicePoint.countDocuments(),
          ServicePoint.countDocuments({ isActive: true }),
          Bill.countDocuments(),
          Bill.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
          Bill.aggregate([{ $match: { status: { $in: ["issued", "overdue"] } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
          AnomalyFlag.countDocuments(),
          AnomalyFlag.countDocuments({ resolvedAt: null }),
          TradeContract.countDocuments(),
          TradeContract.countDocuments({ status: "active" }),
          MarketBid.countDocuments(),
          MarketBid.countDocuments({ status: "accepted" }),
        ]);

        const revenueByMonth = await Bill.aggregate([
          { $match: { status: "paid" } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$periodEnd" } },
              total: { $sum: "$totalAmount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $limit: 12 },
        ]);

        const revenueByService = await Bill.aggregate([
          { $match: { status: "paid" } },
          { $unwind: "$services" },
          { $group: { _id: "$services.serviceType", total: { $sum: "$services.amount" } } },
        ]);

        const usageByService = await UsageReading.aggregate([
          { $match: { timestamp: { $gte: thirtyDaysAgo } } },
          {
            $lookup: {
              from: "servicepoints",
              localField: "servicePointId",
              foreignField: "_id",
              as: "sp",
            },
          },
          { $unwind: "$sp" },
          { $group: { _id: "$sp.serviceType", total: { $sum: "$value" }, unit: { $first: "$unit" } } },
        ]);

        const usageDaily = await UsageReading.aggregate([
          { $match: { timestamp: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
              total: { $sum: "$value" },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        const billStatusDist = await Bill.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$totalAmount" } } },
        ]);

        const anomaliesBySeverity = await AnomalyFlag.aggregate([
          { $group: { _id: "$severity", count: { $sum: 1 } } },
        ]);

        const tradingVolume = await TradeContract.aggregate([
          { $match: { status: "active" } },
          { $group: { _id: null, totalVolume: { $sum: "$volume" }, totalValue: { $sum: { $multiply: ["$volume", "$price"] } } } },
        ]);

        const topCustomers = await Bill.aggregate([
          { $group: { _id: "$customerId", total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
          { $sort: { total: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          { $project: { name: "$user.name", email: "$user.email", total: 1, count: 1 } },
        ]);

        res.json({
          kpis: {
            totalCustomers,
            totalServicePoints,
            activeServicePoints,
            totalBills,
            totalRevenue: Math.round((revenueAgg[0]?.total || 0) * 100) / 100,
            outstanding: Math.round((outstandingAgg[0]?.total || 0) * 100) / 100,
            anomalyCount,
            unresolvedAnomalies,
            contractCount,
            activeContracts,
            bidCount,
            acceptedBids,
            tradingVolume: Math.round((tradingVolume[0]?.totalVolume || 0) * 100) / 100,
            tradingValue: Math.round((tradingVolume[0]?.totalValue || 0) * 100) / 100,
          },
          revenueByMonth: revenueByMonth.map((r) => ({ month: r._id, total: Math.round(r.total * 100) / 100, count: r.count })),
          revenueByService: revenueByService.map((r) => ({ type: r._id, total: Math.round(r.total * 100) / 100 })),
          usageByService: usageByService.map((u) => ({ type: u._id, total: Math.round(u.total * 100) / 100, unit: u.unit })),
          usageDaily: usageDaily.map((d) => ({ date: d._id, value: Math.round(d.total * 100) / 100 })),
          billStatusDist: billStatusDist.map((s) => ({ status: s._id, count: s.count, total: Math.round(s.total * 100) / 100 })),
          anomaliesBySeverity: anomaliesBySeverity.map((a) => ({ severity: a._id, count: a.count })),
          topCustomers: topCustomers.map((c) => ({ name: c.name, email: c.email, total: Math.round(c.total * 100) / 100, bills: c.count })),
        });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { reportsController };
