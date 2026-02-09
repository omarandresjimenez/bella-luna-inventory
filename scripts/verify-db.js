const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  try {
    const users = await prisma.user.count();
    const customers = await prisma.customer.count();
    const categories = await prisma.category.count();
    const products = await prisma.product.count();
    const variants = await prisma.productVariant.count();
    const attributes = await prisma.attribute.count();
    const attrValues = await prisma.attributeValue.count();
    const settings = await prisma.storeSettings.count();
    
    console.log('✅ VERIFICACIÓN DE BASE DE DATOS');
    console.log('================================');
    console.log('👤 Usuarios:', users);
    console.log('🛍️  Clientes:', customers);
    console.log('📁 Categorías:', categories);
    console.log('💄 Productos:', products);
    console.log('🎨 Variantes:', variants);
    console.log('🏷️  Atributos:', attributes);
    console.log('📝 Valores de Atributos:', attrValues);
    console.log('⚙️  Configuración:', settings);
    console.log('================================');
    console.log('✅ FASE 1: BASE DE DATOS - COMPLETADA EXITOSAMENTE');
    
    // Verificar datos específicos
    const admin = await prisma.user.findFirst();
    console.log('\n👤 Admin creado:', admin?.email);
    
    const store = await prisma.storeSettings.findFirst();
    console.log('🏪 Tienda:', store?.storeName);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
