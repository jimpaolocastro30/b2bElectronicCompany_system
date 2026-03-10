const express = require("express");

const { gridController } = require("../controllers/gridController");
const { requireRole } = require("../middleware/requireRole");

function gridRouter(env) {
  const router = express.Router();
  const c = gridController(env);

  router.use(requireRole("admin", "personnel"));

  router.get("/status", c.listStatus);

  return router;
}

module.exports = { gridRouter };

