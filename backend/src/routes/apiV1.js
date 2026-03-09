const express = require("express");

const { requireAuth } = require("../middleware/requireAuth");
const { inventoryRouter } = require("./inventory");
const { ordersRouter } = require("./orders");
const { pricingRouter } = require("./pricing");

function apiV1Router(env) {
  const router = express.Router();
  router.use(requireAuth(env));

  router.use("/inventory", inventoryRouter(env));
  router.use("/orders", ordersRouter(env));
  router.use("/pricing", pricingRouter(env));

  return router;
}

module.exports = { apiV1Router };
