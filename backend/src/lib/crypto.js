const crypto = require("crypto");

function sha256Base64Url(input) {
  return crypto.createHash("sha256").update(input).digest("base64url");
}

function randomToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString("base64url");
}

module.exports = { sha256Base64Url, randomToken };
