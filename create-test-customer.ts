import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Hash a test password
  const hashedPassword = await bcrypt.hash('TestPassword123', 10);

  // Check if test customer exists
  let customer = await prisma.customer.findUnique({
    where: { email: 'notification-test@example.com' },
  });

  if (!customer) {
    console.log('Creating test customer...');
    customer = await prisma.customer.create({
      data: {
        email: 'notification-test@example.com',
        password: hashedPassword,
        firstName: 'Notification',
        lastName: 'Test',
        phone: '1234567890',
        isVerified: true,
      },
    });
    console.log('✅ Created test customer:', customer.email);
  } else {
    console.log('✅ Test customer exists:', customer.email);
  }

  console.log('Email: notification-test@example.com');
  console.log('Password: TestPassword123');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
