const express = require("express");

const { adminController } = require("../controllers/adminController");
const { requireRole } = require("../middleware/requireRole");

function adminRouter(env) {
  const router = express.Router();
  const c = adminController(env);

  router.use(requireRole("admin", "personnel"));

  router.get("/service-points", c.listServicePoints);
  router.post("/usage-readings", c.ingestUsageReadings);
  router.post("/billing/run", c.runBilling);

  return router;
}

module.exports = { adminRouter };

