const express = require("express");
const { requireRole } = require("../middleware/requireRole");
const { pricingController } = require("../controllers/pricingController");

function pricingRouter(env) {
  const router = express.Router();
  const c = pricingController(env);

  router.get("/", c.list);
  router.post("/", requireRole("admin"), c.upsert);
  return router;
}

module.exports = { pricingRouter };
