const dotenv = require("dotenv");

function required(name, value) {
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

function loadEnv() {
  dotenv.config();

  const PORT = Number(process.env.PORT || 4000);
  const MONGODB_URI = required("MONGODB_URI", process.env.MONGODB_URI);

  const CORS_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const ACCESS_TOKEN_SECRET = required(
    "ACCESS_TOKEN_SECRET",
    process.env.ACCESS_TOKEN_SECRET
  );
  const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m";

  const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);
  const ALLOW_ADMIN_BOOTSTRAP = String(
    process.env.ALLOW_ADMIN_BOOTSTRAP || "false"
  ).toLowerCase() === "true";

  const ERP_SYNC_KEY = required("ERP_SYNC_KEY", process.env.ERP_SYNC_KEY);

  const SMTP_HOST = process.env.SMTP_HOST || "";
  const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 0;
  const SMTP_USER = process.env.SMTP_USER || "";
  const SMTP_PASS = process.env.SMTP_PASS || "";
  const SMTP_FROM = process.env.SMTP_FROM || "no-reply@example.com";

  return {
    PORT,
    MONGODB_URI,
    CORS_ORIGINS,
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_TTL,
    REFRESH_TOKEN_TTL_DAYS,
    ALLOW_ADMIN_BOOTSTRAP,
    ERP_SYNC_KEY,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
  };
}

module.exports = { loadEnv };
