const { z } = require("zod");
const { Order } = require("../models/Order");
const { Pricing } = require("../models/Pricing");
const { InventoryItem } = require("../models/InventoryItem");
const { AuditLog } = require("../models/AuditLog");
const { socketHub } = require("../socketHub");

const createSchema = z.object({
  items: z
    .array(
      z.object({
        sku: z.string().min(1).max(80),
        quantity: z.number().int().min(1).max(100000),
      })
    )
    .min(1)
    .max(200),
});

function ordersController(_env) {
  return {
    list: async (req, res, next) => {
      try {
        const role = req.user.role;
        const filter = role === "client" ? { clientId: req.user.id } : {};
        const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);
        res.json({
          orders: orders.map((o) => ({
            id: String(o._id),
            clientId: String(o.clientId),
            status: o.status,
            items: o.items,
            total: o.total,
            createdAt: o.createdAt,
          })),
        });
      } catch (err) {
        next(err);
      }
    },

    create: async (req, res, next) => {
      try {
        const body = createSchema.parse(req.body);

        let total = 0;
        const itemsWithPrice = [];

        for (const item of body.items) {
          const pricing = await Pricing.findOne({ sku: item.sku });
          if (!pricing) {
            const e = new Error(`Missing pricing for SKU ${item.sku}`);
            e.statusCode = 400;
            throw e;
          }

          const inv = await InventoryItem.findOne({ sku: item.sku });
          const available = inv ? Math.max(0, inv.quantityOnHand - inv.reserved) : 0;
          if (available < item.quantity) {
            const e = new Error(`Insufficient stock for SKU ${item.sku}`);
            e.statusCode = 409;
            throw e;
          }

          total += pricing.unitPrice * item.quantity;
          itemsWithPrice.push({
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: pricing.unitPrice,
          });
        }

        // Reserve stock after all validation; for full safety use transactions (replica set required).
        for (const item of body.items) {
          await InventoryItem.updateOne({ sku: item.sku }, { $inc: { reserved: item.quantity } });
        }

        const order = await Order.create({
          clientId: req.user.id,
          status: "pending",
          items: itemsWithPrice,
          total,
        });

        await AuditLog.create({
          actorId: req.user.id,
          action: "orders.create",
          target: String(order._id),
          meta: { total },
        });

        socketHub.emit("order:created", {
          id: String(order._id),
          status: order.status,
          total: order.total,
        });

        res.status(201).json({ orderId: String(order._id) });
      } catch (err) {
        next(err);
      }
    },

    fulfill: async (req, res, next) => {
      try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: "Order not found" });
        if (order.status === "fulfilled") return res.json({ ok: true });

        for (const item of order.items) {
          await InventoryItem.updateOne(
            { sku: item.sku },
            { $inc: { reserved: -item.quantity, quantityOnHand: -item.quantity } }
          );
        }

        order.status = "fulfilled";
        await order.save();

        await AuditLog.create({
          actorId: req.user.id,
          action: "orders.fulfill",
          target: String(order._id),
        });

        socketHub.emit("order:fulfilled", { id: String(order._id) });
        res.json({ ok: true });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { ordersController };
