const { verifyAccessToken } = require("../services/authTokens");

function requireAuth(env) {
  return function requireAuthMiddleware(req, res, next) {
    try {
      const header = req.headers.authorization || "";
      const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
      const token = req.cookies.accessToken || bearer;

      if (!token) return res.status(401).json({ error: "Unauthorized" });

      const payload = verifyAccessToken(env, token);
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return next();
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
}

module.exports = { requireAuth };
