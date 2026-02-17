import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get the test customer
  const customer = await prisma.customer.findUnique({
    where: { email: 'notification-test@example.com' },
  });

  if (!customer) {
    console.log('❌ Test customer not found');
    return;
  }

  // Create an address for the customer
  const address = await prisma.address.create({
    data: {
      customerId: customer.id,
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'Colombia',
      isDefault: true,
    },
  });

  console.log('✅ Created address:', address.id);
  console.log('Use this addressId in orders:', address.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
