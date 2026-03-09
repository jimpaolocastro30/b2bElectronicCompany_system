const express = require("express");
const { erpSyncController } = require("../controllers/erpSyncController");

function requireErpKey(env) {
  return function requireErpKeyMiddleware(req, res, next) {
    const key = req.headers["x-erp-key"];
    if (!key || key !== env.ERP_SYNC_KEY) return res.status(401).json({ error: "Unauthorized" });
    return next();
  };
}

function erpSyncRouter(env) {
  const router = express.Router();
  const c = erpSyncController(env);

  router.use(requireErpKey(env));
  router.post("/inventory", c.pushInventory);
  router.post("/pricing", c.pushPricing);

  return router;
}

module.exports = { erpSyncRouter };
