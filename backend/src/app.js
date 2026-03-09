const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");
const { authRouter } = require("./routes/auth");
const { apiV1Router } = require("./routes/apiV1");
const { erpSyncRouter } = require("./routes/erpSync");

function createApp(env) {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        // allow non-browser / same-origin
        if (!origin) return cb(null, true);
        if (env.CORS_ORIGINS.includes(origin)) return cb(null, true);
        return cb(new Error("CORS blocked"), false);
      },
      credentials: true,
    })
  );

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/auth", authRouter(env));
  app.use("/erp-sync", erpSyncRouter(env));
  app.use("/api/v1", apiV1Router(env));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
