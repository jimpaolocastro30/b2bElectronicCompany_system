const http = require("http");
const { loadEnv } = require("./lib/env");
const { connectMongo } = require("./lib/mongo");
const { createApp } = require("./app");
const { attachSocketServer } = require("./socket");

async function main() {
  const env = loadEnv();
  await connectMongo(env.MONGODB_URI);

  const app = createApp(env);
  const server = http.createServer(app);
  attachSocketServer(server, env);

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[backend] fatal error", err);
  process.exit(1);
});
