import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createCustomer() {
  try {
    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: 'customer@example.com' },
    });

    if (existingCustomer) {
      console.log('✅ Customer user already exists!');
      console.log('  Email: customer@example.com');
      console.log('  Password: password123');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create the customer user
    const customer = await prisma.customer.create({
      data: {
        email: 'customer@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Customer',
        phone: '+1 (555) 000-0000',
        isVerified: true,
      },
    });

    console.log('✅ Customer user created successfully!');
    console.log('  ID: ' + customer.id);
    console.log('  Email: ' + customer.email);
    console.log('  Password: password123');
    console.log('\n🔑 Test Credentials:');
    console.log('  Email: customer@example.com');
    console.log('  Password: password123');
  } catch (error) {
    console.error('❌ Error creating customer user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCustomer();
