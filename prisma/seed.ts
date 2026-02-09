import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed data...')

  // ============================================
  // 1. USUARIO ADMIN
  // ============================================
  console.log('👤 Creando usuario admin...')
  
  const adminPassword = await bcrypt.hash('admin123', 12)
  
  await prisma.user.upsert({
    where: { email: 'admin@bellaluna.com' },
    update: {},
    create: {
      email: 'admin@bellaluna.com',
      password: adminPassword,
      firstName: 'Administrador',
      lastName: 'Bella Luna',
      role: 'ADMIN',
      isActive: true,
    },
  })

  // ============================================
  // 2. CONFIGURACIÓN DE TIENDA
  // ============================================
  console.log('⚙️  Configurando tienda...')
  
  await prisma.storeSettings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      storeName: 'Bella Luna',
      storeEmail: 'contacto@bellaluna.com',
      storePhone: '+57 300 123 4567',
      storeAddress: 'Calle 123 #45-67, Bogotá, Colombia',
      whatsappNumber: '+573001234567',
      deliveryFee: 8000,
      freeDeliveryThreshold: 150000,
      metaTitle: 'Bella Luna - Distribuidora de Productos de Belleza',
      metaDescription: 'Encuentra los mejores productos de belleza, maquillaje y skincare. Envíos a domicilio o recoge en tienda.',
    },
  })

  // ============================================
  // 3. CATEGORÍAS JERÁRQUICAS
  // ============================================
  console.log('📂 Creando categorías...')

  const categorias = [
    {
      name: 'Maquillaje',
      slug: 'maquillaje',
      description: 'Todo para tu look perfecto',
      isFeatured: true,
      sortOrder: 1,
      children: [
        { name: 'Labios', slug: 'labios', description: 'Labiales, gloss y más', sortOrder: 1 },
        { name: 'Rostro', slug: 'rostro', description: 'Bases, correctores y polvos', sortOrder: 2 },
        { name: 'Ojos', slug: 'ojos', description: 'Sombras, delineadores y máscaras', sortOrder: 3 },
      ]
    },
    {
      name: 'Skincare',
      slug: 'skincare',
      description: 'Cuidado de la piel',
      isFeatured: true,
      sortOrder: 2,
      children: [
        { name: 'Limpiadores', slug: 'limpiadores', description: 'Limpieza facial', sortOrder: 1 },
        { name: 'Hidratantes', slug: 'hidratantes', description: 'Cremas y serums', sortOrder: 2 },
        { name: 'Tratamientos', slug: 'tratamientos-faciales', description: 'Mascarillas y tratamientos específicos', sortOrder: 3 },
      ]
    },
    {
      name: 'Cabello',
      slug: 'cabello',
      description: 'Cuidado capilar',
      isFeatured: false,
      sortOrder: 3,
      children: [
        { name: 'Shampoo', slug: 'shampoo', description: 'Limpieza capilar', sortOrder: 1 },
        { name: 'Acondicionador', slug: 'acondicionador', description: 'Suavidad y brillo', sortOrder: 2 },
        { name: 'Tratamientos', slug: 'tratamientos-capilares', description: 'Reparación y nutrición', sortOrder: 3 },
      ]
    },
    {
      name: 'Fragancias',
      slug: 'fragancias',
      description: 'Perfumes y colonias',
      isFeatured: true,
      sortOrder: 4,
      children: []
    },
    {
      name: 'Uñas',
      slug: 'unas',
      description: 'Esmaltes y cuidado de uñas',
      isFeatured: false,
      sortOrder: 5,
      children: []
    },
    {
      name: 'Accesorios',
      slug: 'accesorios',
      description: 'Brochas, esponjas y más',
      isFeatured: false,
      sortOrder: 6,
      children: []
    },
  ]

  for (const cat of categorias) {
    const { children, ...catData } = cat
    
    const categoriaPadre = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: {},
      create: catData,
    })

    // Crear subcategorías
    for (const child of children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: {},
        create: {
          ...child,
          parentId: categoriaPadre.id,
        },
      })
    }
  }

  // ============================================
  // 4. ATRIBUTOS EAV
  // ============================================
  console.log('🏷️  Creando atributos de producto...')

  const atributos = [
    {
      name: 'color',
      displayName: 'Color',
      type: 'COLOR_HEX' as const,
      values: [
        { value: 'rojo-pasion', displayValue: 'Rojo Pasión', colorHex: '#DC143C' },
        { value: 'rosa-dulce', displayValue: 'Rosa Dulce', colorHex: '#FFB6C1' },
        { value: 'nude-natural', displayValue: 'Nude Natural', colorHex: '#D2B48C' },
        { value: 'coral-vivo', displayValue: 'Coral Vivo', colorHex: '#FF7F50' },
        { value: 'bordeaux', displayValue: 'Bordó', colorHex: '#800020' },
        { value: 'vino-tinto', displayValue: 'Vino Tinto', colorHex: '#722F37' },
        { value: 'naranja-fuego', displayValue: 'Naranja Fuego', colorHex: '#FF4500' },
        { value: 'rosa-viejo', displayValue: 'Rosa Viejo', colorHex: '#C08081' },
      ]
    },
    {
      name: 'tamaño',
      displayName: 'Tamaño',
      type: 'TEXT' as const,
      values: [
        { value: '15ml', displayValue: '15 ml' },
        { value: '30ml', displayValue: '30 ml' },
        { value: '50ml', displayValue: '50 ml' },
        { value: '100ml', displayValue: '100 ml' },
        { value: 's', displayValue: 'Pequeño (S)' },
        { value: 'm', displayValue: 'Mediano (M)' },
        { value: 'l', displayValue: 'Grande (L)' },
      ]
    },
    {
      name: 'presentacion',
      displayName: 'Presentación',
      type: 'TEXT' as const,
      values: [
        { value: 'liquido', displayValue: 'Líquido' },
        { value: 'pomada', displayValue: 'Pomada' },
        { value: 'polvo', displayValue: 'Polvo' },
        { value: 'crema', displayValue: 'Crema' },
        { value: 'gel', displayValue: 'Gel' },
        { value: 'lapiz', displayValue: 'Lápiz' },
      ]
    },
  ]

  for (const attr of atributos) {
    const { values, ...attrData } = attr
    
    const atributo = await prisma.attribute.upsert({
      where: { name: attrData.name },
      update: {},
      create: attrData,
    })

    // Crear valores de atributo
    for (const val of values) {
      await prisma.attributeValue.upsert({
        where: {
          id: `${atributo.id}-${val.value}`,
        },
        update: {},
        create: {
          ...val,
          attributeId: atributo.id,
        },
      })
    }
  }

  // ============================================
  // 5. PRODUCTOS DE EJEMPLO
  // ============================================
  console.log('💄 Creando productos de ejemplo...')

  // Obtener categorías y atributos creados
  const catLabios = await prisma.category.findUnique({ where: { slug: 'labios' } })
  const catRostro = await prisma.category.findUnique({ where: { slug: 'rostro' } })
  const catSkincare = await prisma.category.findUnique({ where: { slug: 'hidratantes' } })
  
  const attrColor = await prisma.attribute.findUnique({ where: { name: 'color' } })
  const attrTamaño = await prisma.attribute.findUnique({ where: { name: 'tamaño' } })
  const attrPresentacion = await prisma.attribute.findUnique({ where: { name: 'presentacion' } })
  
  // Obtener valores de color
  const valoresColor = await prisma.attributeValue.findMany({
    where: { attributeId: attrColor!.id },
  })

  // Producto 1: Labial Líquido Matte
  const producto1 = await prisma.product.upsert({
    where: { sku: 'LAB-MAT-001' },
    update: {},
    create: {
      sku: 'LAB-MAT-001',
      name: 'Labial Líquido Matte Longwear',
      description: 'Labial líquido de larga duración con acabado matte. No transfiere, hidrata tus labios y dura hasta 12 horas.',
      brand: 'Bella Luna Pro',
      slug: 'labial-liquido-matte-longwear',
      baseCost: 15000,
      basePrice: 35000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: true,
    },
  })

  // Asociar categorías
  await prisma.productCategory.createMany({
    data: [
      { productId: producto1.id, categoryId: catLabios!.id },
    ],
    skipDuplicates: true,
  })

  // Asociar atributos aplicables (color y tamaño)
  await prisma.productAttribute.createMany({
    data: [
      { productId: producto1.id, attributeId: attrColor!.id },
      { productId: producto1.id, attributeId: attrTamaño!.id },
    ],
    skipDuplicates: true,
  })

  // Crear variantes
  for (let i = 0; i < 4; i++) {
    const color = valoresColor[i]
    const variant = await prisma.productVariant.create({
      data: {
        productId: producto1.id,
        cost: 15000,
        price: 35000,
        stock: 50 + i * 10,
        isActive: true,
      },
    })

    // Asociar valor de color
    await prisma.variantAttributeValue.create({
      data: {
        variantId: variant.id,
        attributeValueId: color.id,
      },
    })
  }

  // Producto 2: Base de Maquillaje
  const producto2 = await prisma.product.upsert({
    where: { sku: 'BASE-LIQ-002' },
    update: {},
    create: {
      sku: 'BASE-LIQ-002',
      name: 'Base Líquida Cobertura Total',
      description: 'Base líquida de alta cobertura con acabado natural. Hidrata y unifica el tono de la piel.',
      brand: 'Bella Luna Pro',
      slug: 'base-liquida-cobertura-total',
      baseCost: 25000,
      basePrice: 55000,
      discountPercent: 10,
      trackStock: true,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productCategory.createMany({
    data: [
      { productId: producto2.id, categoryId: catRostro!.id },
    ],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto2.id, attributeId: attrTamaño!.id },
      { productId: producto2.id, attributeId: attrPresentacion!.id },
    ],
    skipDuplicates: true,
  })

  // Producto 3: Serum Facial
  const producto3 = await prisma.product.upsert({
    where: { sku: 'SER-HID-003' },
    update: {},
    create: {
      sku: 'SER-HID-003',
      name: 'Sérum Hidratante Ácido Hialurónico',
      description: 'Sérum concentrado con ácido hialurónico para hidración profunda. Reduce líneas finas y mejora la elasticidad.',
      brand: 'Bella Luna Skin',
      slug: 'serum-hidratante-acido-hialuronico',
      baseCost: 35000,
      basePrice: 75000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: false,
    },
  })

  await prisma.productCategory.createMany({
    data: [
      { productId: producto3.id, categoryId: catSkincare!.id },
    ],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto3.id, attributeId: attrTamaño!.id },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed data completado exitosamente!')
  console.log('')
  console.log('📊 Resumen:')
  console.log('  • 1 Usuario admin creado')
  console.log('  • 1 Configuración de tienda')
  console.log('  • 6 Categorías principales + subcategorías')
  console.log('  • 3 Atributos (Color, Tamaño, Presentación)')
  console.log('  • 3 Productos de ejemplo con variantes')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
