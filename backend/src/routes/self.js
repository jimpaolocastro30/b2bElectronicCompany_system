const express = require("express");

const { selfController } = require("../controllers/selfController");
const { requireRole } = require("../middleware/requireRole");

function selfRouter(env) {
  const router = express.Router();
  const c = selfController(env);

  router.use(requireRole("client"));

  router.get("/profile", c.profile);
  router.get("/usage", c.usage);
  router.get("/bills", c.listBills);
  router.get("/bills/:id", c.getBill);
  router.post("/service-requests", c.createServiceRequest);

  return router;
}

module.exports = { selfRouter };

