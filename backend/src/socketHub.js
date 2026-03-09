const socketHub = {
  /** @type {import("socket.io").Server | null} */
  io: null,
  emit(event, payload) {
    if (!this.io) return;
    this.io.emit(event, payload);
  },
};

module.exports = { socketHub };
