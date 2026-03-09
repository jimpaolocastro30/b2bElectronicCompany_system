const express = require("express");
const { requireRole } = require("../middleware/requireRole");
const { inventoryController } = require("../controllers/inventoryController");

function inventoryRouter(env) {
  const router = express.Router();
  const c = inventoryController(env);

  router.get("/", c.list);
  router.post("/", requireRole("admin", "personnel"), c.upsert);

  return router;
}

module.exports = { inventoryRouter };
