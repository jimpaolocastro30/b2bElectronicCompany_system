const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const { User } = require("../models/User");
const { AuditLog } = require("../models/AuditLog");
const {
  signAccessToken,
  cookieOptions,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} = require("../services/authTokens");
const { generateOtp, isMfaRole, setUserOtp, verifyUserOtp, clearUserOtp } = require("../services/mfa");
const { sendOtpEmail } = require("../services/email");

const registerSchema = z.object({
  email: z.string().email().max(320),
  name: z.string().min(2).max(120),
  password: z.string().min(8).max(200),
  role: z.enum(["client", "admin", "personnel"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
});

const verifyMfaSchema = z.object({
  mfaToken: z.string().min(1),
  code: z.string().regex(/^\d{6}$/),
});

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("accessToken", accessToken, { ...cookieOptions(), maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res) {
  res.clearCookie("accessToken", cookieOptions());
  res.clearCookie("refreshToken", cookieOptions());
}

function authController(env) {
  return {
    register: async (req, res, next) => {
      try {
        const body = registerSchema.parse(req.body);
        const requestedRole = body.role || "client";

        let role = "client";
        if (requestedRole === "admin") {
          if (!env.ALLOW_ADMIN_BOOTSTRAP) {
            return res.status(403).json({ error: "Admin bootstrap disabled" });
          }
          const adminExists = await User.exists({ role: "admin" });
          if (adminExists) {
            return res.status(403).json({ error: "Admin already exists" });
          }
          role = "admin";
        }

        const passwordHash = await bcrypt.hash(body.password, 12);
        const user = await User.create({
          email: body.email,
          name: body.name,
          role,
          passwordHash,
        });

        await AuditLog.create({
          actorId: user._id,
          action: "auth.register",
          target: String(user._id),
          meta: { role: user.role },
        });

        return res.status(201).json({
          user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
        });
      } catch (err) {
        if (err?.code === 11000) return res.status(409).json({ error: "Email already in use" });
        return next(err);
      }
    },

    login: async (req, res, next) => {
      try {
        const body = loginSchema.parse(req.body);
        const user = await User.findOne({ email: body.email });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const ok = await bcrypt.compare(body.password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: "Invalid credentials" });

        if (isMfaRole(user.role)) {
          const code = generateOtp();
          setUserOtp(user, code);
          await user.save();
          await sendOtpEmail(env, user.email, code);

          const mfaToken = jwt.sign(
            { email: user.email, role: user.role, mfa: true },
            env.ACCESS_TOKEN_SECRET,
            { subject: String(user._id), expiresIn: "10m" }
          );

          await AuditLog.create({
            actorId: user._id,
            action: "auth.login.mfa_challenge",
            target: String(user._id),
          });

          return res.json({ mfaRequired: true, mfaToken });
        }

        const accessToken = signAccessToken(env, user);
        const refresh = await issueRefreshToken(env, user._id);
        setAuthCookies(res, accessToken, refresh.raw);

        await AuditLog.create({
          actorId: user._id,
          action: "auth.login",
          target: String(user._id),
        });

        return res.json({
          user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
        });
      } catch (err) {
        return next(err);
      }
    },

    verifyMfa: async (req, res, next) => {
      try {
        const body = verifyMfaSchema.parse(req.body);
        const payload = jwt.verify(body.mfaToken, env.ACCESS_TOKEN_SECRET);
        if (!payload?.mfa) return res.status(401).json({ error: "Invalid MFA token" });

        const user = await User.findById(payload.sub);
        if (!user) return res.status(401).json({ error: "Invalid MFA token" });
        if (!isMfaRole(user.role)) return res.status(401).json({ error: "MFA not required" });

        const result = verifyUserOtp(user, body.code);
        if (!result.ok) {
          await user.save();
          return res.status(401).json({ error: "Invalid code" });
        }

        clearUserOtp(user);
        await user.save();

        const accessToken = signAccessToken(env, user);
        const refresh = await issueRefreshToken(env, user._id);
        setAuthCookies(res, accessToken, refresh.raw);

        await AuditLog.create({
          actorId: user._id,
          action: "auth.login.mfa_verified",
          target: String(user._id),
        });

        return res.json({
          user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
        });
      } catch (err) {
        return next(err);
      }
    },

    refresh: async (req, res, next) => {
      try {
        const presented = req.cookies.refreshToken;
        if (!presented) return res.status(401).json({ error: "Unauthorized" });

        const rotated = await rotateRefreshToken(env, presented);
        if (!rotated.ok) return res.status(401).json({ error: "Unauthorized" });

        const user = await User.findById(rotated.userId);
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const accessToken = signAccessToken(env, user);
        setAuthCookies(res, accessToken, rotated.refresh.raw);
        return res.json({ ok: true });
      } catch (err) {
        return next(err);
      }
    },

    logout: async (req, res, next) => {
      try {
        const presented = req.cookies.refreshToken;
        await revokeRefreshToken(presented);
        clearAuthCookies(res);
        return res.json({ ok: true });
      } catch (err) {
        return next(err);
      }
    },

    me: async (req, res) => {
      res.json({ user: req.user });
    },
  };
}

module.exports = { authController };
