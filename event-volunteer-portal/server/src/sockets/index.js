let ioInstance = null;

exports.init = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Join an event room for live slot updates
    socket.on('event:join', (eventId) => {
      if (eventId) socket.join(`event:${eventId}`);
    });
    socket.on('event:leave', (eventId) => {
      if (eventId) socket.leave(`event:${eventId}`);
    });

    // Join a user room for personal notifications
    socket.on('user:join', (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
  });
};

exports.emitRoleUpdate = (eventId, role) => {
  if (!ioInstance) return;
  ioInstance.to(`event:${eventId}`).emit('role:update', role);
};

exports.emitNotification = (userId, notification) => {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit('notification', notification);
};
