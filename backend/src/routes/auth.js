const express = require("express");
const rateLimit = require("express-rate-limit");

const { authController } = require("../controllers/authController");
const { requireAuth } = require("../middleware/requireAuth");

function authRouter(env) {
  const router = express.Router();
  const c = authController(env);

  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });

  router.post("/register", authLimiter, c.register);
  router.post("/login", authLimiter, c.login);
  router.post("/mfa/verify", authLimiter, c.verifyMfa);
  router.post("/refresh", c.refresh);
  router.post("/logout", c.logout);
  router.get("/me", requireAuth(env), c.me);

  return router;
}

module.exports = { authRouter };
