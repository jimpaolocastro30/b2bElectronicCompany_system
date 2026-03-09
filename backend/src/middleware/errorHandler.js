function errorHandler(err, _req, res, _next) {
  const status = Number(err.statusCode || err.status || 500);
  const message =
    status >= 500 ? "Internal server error" : err.message || "Request failed";

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error("[backend] error", err);
  }

  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
