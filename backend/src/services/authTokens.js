const jwt = require("jsonwebtoken");
const { RefreshToken } = require("../models/RefreshToken");
const { sha256Base64Url, randomToken } = require("../lib/crypto");

function signAccessToken(env, user) {
  return jwt.sign(
    { email: user.email, role: user.role },
    env.ACCESS_TOKEN_SECRET,
    {
      subject: String(user._id),
      expiresIn: env.ACCESS_TOKEN_TTL,
    }
  );
}

function verifyAccessToken(env, token) {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };
}

async function issueRefreshToken(env, userId) {
  const raw = randomToken(48);
  const tokenHash = sha256Base64Url(raw);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await RefreshToken.create({ userId, tokenHash, expiresAt });
  return { raw, tokenHash, expiresAt };
}

async function rotateRefreshToken(env, presentedRaw) {
  const presentedHash = sha256Base64Url(presentedRaw);
  const existing = await RefreshToken.findOne({ tokenHash: presentedHash });
  if (!existing) return { ok: false, reason: "not_found" };
  if (existing.revokedAt) return { ok: false, reason: "revoked" };
  if (existing.expiresAt.getTime() <= Date.now()) return { ok: false, reason: "expired" };

  const replacement = await issueRefreshToken(env, existing.userId);
  existing.revokedAt = new Date();
  existing.replacedByTokenHash = replacement.tokenHash;
  await existing.save();

  return { ok: true, userId: existing.userId, refresh: replacement };
}

async function revokeRefreshToken(presentedRaw) {
  if (!presentedRaw) return;
  const presentedHash = sha256Base64Url(presentedRaw);
  await RefreshToken.updateOne(
    { tokenHash: presentedHash, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  cookieOptions,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
};
