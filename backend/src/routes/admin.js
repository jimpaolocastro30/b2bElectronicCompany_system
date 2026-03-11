const express = require("express");

const { adminController } = require("../controllers/adminController");
const { reportsController } = require("../controllers/reportsController");
const { requireRole } = require("../middleware/requireRole");

function adminRouter(env) {
  const router = express.Router();
  const c = adminController(env);
  const r = reportsController(env);

  router.use(requireRole("admin", "personnel"));

  router.get("/service-points", c.listServicePoints);
  router.post("/usage-readings", c.ingestUsageReadings);
  router.post("/billing/run", c.runBilling);
  router.get("/dashboard", r.adminDashboard);

  return router;
}

module.exports = { adminRouter };

