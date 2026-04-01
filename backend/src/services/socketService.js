const jwt = require('jsonwebtoken');
const ServiceProvider = require('../models/ServiceProvider');

let io = null;

const providerRoom = (providerId) => `provider:${String(providerId)}`;

const initializeSocket = (server) => {
  const { Server } = require('socket.io');

  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization || '';
      const raw = String(authHeader).startsWith('Bearer ') ? String(authHeader).split(' ')[1] : String(authHeader);

      if (!raw) {
        return next(new Error('Unauthorized'));
      }

      const decoded = jwt.verify(raw, process.env.JWT_SECRET);
      const provider = await ServiceProvider.findById(decoded.providerId).select('_id');

      if (!provider) {
        return next(new Error('Unauthorized'));
      }

      socket.providerId = String(provider._id);
      return next();
    } catch (_error) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(providerRoom(socket.providerId));

    socket.on('notification:read-all', () => {
      io.to(providerRoom(socket.providerId)).emit('notification:read-all:ack');
    });
  });

  return io;
};

const getIO = () => io;

const emitToProvider = (providerId, event, payload) => {
  if (!io || !providerId) return;
  io.to(providerRoom(providerId)).emit(event, payload);
};

module.exports = {
  initializeSocket,
  getIO,
  emitToProvider,
  providerRoom,
};
