const express = require("express");
const { requireRole } = require("../middleware/requireRole");
const { ordersController } = require("../controllers/ordersController");

function ordersRouter(env) {
  const router = express.Router();
  const c = ordersController(env);

  router.get("/", c.list);
  router.post("/", requireRole("client"), c.create);
  router.post("/:id/fulfill", requireRole("admin", "personnel"), c.fulfill);

  return router;
}

module.exports = { ordersRouter };
