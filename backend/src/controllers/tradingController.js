const { z } = require("zod");
const { TradeContract } = require("../models/TradeContract");
const { MarketBid } = require("../models/MarketBid");
const { AuditLog } = require("../models/AuditLog");

const contractSchema = z.object({
  counterpartyName: z.string().min(1).max(200),
  productType: z.string().min(1).max(120),
  volume: z.number().positive(),
  price: z.number().nonnegative(),
  currency: z.string().min(3).max(8).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(["draft", "active", "expired", "cancelled"]).optional(),
});

const bidSchema = z.object({
  market: z.string().min(1).max(120),
  deliveryDate: z.string().datetime(),
  hourBlock: z.string().min(1).max(40),
  volume: z.number().positive(),
  price: z.number().nonnegative(),
  currency: z.string().min(3).max(8).optional(),
  status: z.enum(["draft", "submitted", "accepted", "rejected", "cancelled"]).optional(),
});

function tradingController(_env) {
  return {
    listContracts: async (_req, res, next) => {
      try {
        const contracts = await TradeContract.find().sort({ createdAt: -1 }).limit(200);
        res.json({
          contracts: contracts.map((c) => ({
            id: String(c._id),
            counterpartyName: c.counterpartyName,
            productType: c.productType,
            volume: c.volume,
            price: c.price,
            currency: c.currency,
            startDate: c.startDate,
            endDate: c.endDate,
            status: c.status,
          })),
        });
      } catch (err) {
        next(err);
      }
    },

    createContract: async (req, res, next) => {
      try {
        const body = contractSchema.parse(req.body);
        const contract = await TradeContract.create({
          ...body,
          currency: body.currency || "USD",
          status: body.status || "draft",
        });
        await AuditLog.create({
          actorId: req.user.id,
          action: "trading.contract_signed",
          target: String(contract._id),
          meta: { counterpartyName: contract.counterpartyName },
        });
        res.status(201).json({ id: String(contract._id) });
      } catch (err) {
        next(err);
      }
    },

    listBids: async (_req, res, next) => {
      try {
        const bids = await MarketBid.find().sort({ createdAt: -1 }).limit(200);
        res.json({
          bids: bids.map((b) => ({
            id: String(b._id),
            market: b.market,
            deliveryDate: b.deliveryDate,
            hourBlock: b.hourBlock,
            volume: b.volume,
            price: b.price,
            currency: b.currency,
            status: b.status,
          })),
        });
      } catch (err) {
        next(err);
      }
    },

    createBid: async (req, res, next) => {
      try {
        const body = bidSchema.parse(req.body);
        const bid = await MarketBid.create({
          ...body,
          currency: body.currency || "USD",
          status: body.status || "draft",
        });
        await AuditLog.create({
          actorId: req.user.id,
          action: "trading.bid_placed",
          target: String(bid._id),
          meta: { market: bid.market },
        });
        res.status(201).json({ id: String(bid._id) });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { tradingController };

