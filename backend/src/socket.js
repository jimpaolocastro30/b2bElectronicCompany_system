const { Server } = require("socket.io");
const { socketHub } = require("./socketHub");

function attachSocketServer(httpServer, env) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.emit("server:hello", { ok: true });
  });

  socketHub.io = io;
}

module.exports = { attachSocketServer };
