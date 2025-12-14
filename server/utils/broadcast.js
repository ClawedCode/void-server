/**
 * WebSocket Broadcast Utility
 *
 * Provides a simple interface for broadcasting events to connected WebSocket clients.
 * The io instance is set by the server during initialization.
 */

let io = null;

function setIO(socketIO) {
  io = socketIO;
}

function broadcast(event, data) {
  if (io) {
    io.emit(event, data);
  }
}

module.exports = { setIO, broadcast };
