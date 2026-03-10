const express = require("express");

const { tradingController } = require("../controllers/tradingController");
const { requireRole } = require("../middleware/requireRole");

function tradingRouter(env) {
  const router = express.Router();
  const c = tradingController(env);

  // Restrict to admin/personnel for now; later could add dedicated trader role
  router.use(requireRole("admin", "personnel"));

  router.get("/contracts", c.listContracts);
  router.post("/contracts", c.createContract);
  router.get("/market-bids", c.listBids);
  router.post("/market-bids", c.createBid);

  return router;
}

module.exports = { tradingRouter };

