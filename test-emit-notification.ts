import { PrismaClient } from '@prisma/client';
import { NotificationService } from './src/services/NotificationService.js';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

const prisma = new PrismaClient();
const httpServer = http.createServer();
const io = new SocketIOServer(httpServer, {
  cors: { origin: 'http://localhost:5173', credentials: true },
});

async function testNotificationEmit() {
  console.log('Setting up Socket.io server...');
  NotificationService.initialize(io);

  // Wait for socket connections
  console.log('Waiting 2 seconds for client connections...');
  await new Promise((r) => setTimeout(r, 2000));

  console.log('Emitting test notification...');
  const testOrder = {
    id: 'test-order-1',
    orderNumber: 'TEST-0000001',
    customerId: 'test-customer',
    status: 'pending',
    total: 100,
    createdAt: new Date(),
    customer: {
      firstName: 'Test',
      lastName: 'Customer',
      email: 'test@example.com',
    },
  };

  NotificationService.emitNewOrder(testOrder);

  console.log('Notification emitted. Checking stored notifications...');

  // Give it a moment to process
  await new Promise((r) => setTimeout(r, 1000));

  console.log('Test completed. Keep the server running...');
  console.log('Connect a WebSocket client within 10 seconds to receive the notification');

  // Keep server alive for 10 seconds
  httpServer.listen(3001, () => {
    console.log('Test server listening on port 3001');
  });

  setTimeout(() => {
    console.log('Test completed');
    process.exit(0);
  }, 10000);
}

testNotificationEmit().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
