const mongoose = require("mongoose");

const ROLES = ["client", "admin", "personnel"];

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ROLES, default: "client", required: true },
    passwordHash: { type: String, required: true },

    mfaOtpHash: { type: String, default: null },
    mfaOtpExpiresAt: { type: Date, default: null },
    mfaOtpAttempts: { type: Number, default: 0 },
    mfaOtpSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = { User, ROLES };
