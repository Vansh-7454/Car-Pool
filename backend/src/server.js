import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { PORT, CLIENT_ORIGIN } from './config/env.js';
import { ensureDefaultAdmin } from './utils/seedAdmin.js';

async function start() {
  await connectDB();
  await ensureDefaultAdmin();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: CLIENT_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);

    socket.on('join_ride', ({ rideId }) => {
      if (!rideId) return;
      socket.join(`ride:${rideId}`);
    });

    socket.on('driver_location', ({ rideId, lat, lng }) => {
      if (!rideId || typeof lat !== 'number' || typeof lng !== 'number') return;
      io.to(`ride:${rideId}`).emit('location_update', {
        rideId,
        lat,
        lng,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected', socket.id);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
