import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({ take: 5 });
  console.log(
    'Customers:',
    customers.map((c) => ({ id: c.id, email: c.email }))
  );

  if (customers.length === 0) {
    console.log('No customers found, creating test customer...');
    const newCustomer = await prisma.customer.create({
      data: {
        email: 'test@example.com',
        password: '$2a$10$...', // placeholder
        firstName: 'Test',
        lastName: 'Customer',
        phone: '1234567890',
      },
    });
    console.log('Created customer:', newCustomer.email);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
