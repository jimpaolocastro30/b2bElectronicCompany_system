const express = require("express");

const { securityController } = require("../controllers/securityController");
const { requireRole } = require("../middleware/requireRole");

function securityRouter(env) {
  const router = express.Router();
  const c = securityController(env);

  router.use(requireRole("admin", "personnel"));

  router.get("/anomalies", c.listAnomalies);
  router.post("/anomalies/scan", c.scanAnomalies);

  return router;
}

module.exports = { securityRouter };

