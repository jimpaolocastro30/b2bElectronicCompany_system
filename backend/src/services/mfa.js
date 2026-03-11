const { sha256Base64Url } = require("../lib/crypto");

function generateOtp() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return String(n);
}

function otpHash(code) {
  return sha256Base64Url(code);
}

function isMfaRole() {
  return false;
}

function setUserOtp(user, code) {
  user.mfaOtpHash = otpHash(code);
  user.mfaOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  user.mfaOtpAttempts = 0;
  user.mfaOtpSentAt = new Date();
}

function verifyUserOtp(user, code) {
  if (!user.mfaOtpHash || !user.mfaOtpExpiresAt) return { ok: false, reason: "missing" };
  if (user.mfaOtpExpiresAt.getTime() <= Date.now()) return { ok: false, reason: "expired" };
  if ((user.mfaOtpAttempts || 0) >= 5) return { ok: false, reason: "locked" };

  const matches = otpHash(code) === user.mfaOtpHash;
  user.mfaOtpAttempts = (user.mfaOtpAttempts || 0) + 1;

  if (!matches) return { ok: false, reason: "invalid" };
  return { ok: true };
}

function clearUserOtp(user) {
  user.mfaOtpHash = null;
  user.mfaOtpExpiresAt = null;
  user.mfaOtpAttempts = 0;
}

module.exports = {
  generateOtp,
  isMfaRole,
  setUserOtp,
  verifyUserOtp,
  clearUserOtp,
};
