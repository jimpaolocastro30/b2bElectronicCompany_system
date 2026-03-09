function requireRole(...roles) {
  return function requireRoleMiddleware(req, res, next) {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(role)) return res.status(403).json({ error: "Forbidden" });
    return next();
  };
}

module.exports = { requireRole };
