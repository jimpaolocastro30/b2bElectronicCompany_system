const express = require("express");

const { requireAuth } = require("../middleware/requireAuth");
const { inventoryRouter } = require("./inventory");
const { ordersRouter } = require("./orders");
const { pricingRouter } = require("./pricing");
const { selfRouter } = require("./self");
const { adminRouter } = require("./admin");
const { tradingRouter } = require("./trading");
const { gridRouter } = require("./grid");
const { securityRouter } = require("./security");

function apiV1Router(env) {
  const router = express.Router();
  router.use(requireAuth(env));

  // Legacy electronics routes (can be removed once portal is fully migrated)
  router.use("/inventory", inventoryRouter(env));
  router.use("/orders", ordersRouter(env));
  router.use("/pricing", pricingRouter(env));

  // Energy portal routes
  router.use("/self", selfRouter(env));
  router.use("/admin", adminRouter(env));
  router.use("/trading", tradingRouter(env));
  router.use("/grid", gridRouter(env));
  router.use("/security", securityRouter(env));

  return router;
}

module.exports = { apiV1Router };
