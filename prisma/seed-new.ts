import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ============================================
  // 1. ADMIN USER
  // ============================================
  console.log('Creating admin user...')
  
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
  // 2. STORE SETTINGS
  // ============================================
  console.log('Creating store settings...')
  
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
  // 3. TEST CUSTOMER
  // ============================================
  console.log('Creating test customer...')
  
  const customerPassword = await bcrypt.hash('customer123', 12)
  
  await prisma.customer.upsert({
    where: { email: 'cliente@test.com' },
    update: {},
    create: {
      email: 'cliente@test.com',
      password: customerPassword,
      firstName: 'Cliente',
      lastName: 'Test',
      phone: '+57 300 999 8888',
      isActive: true,
      emailVerified: true,
    },
  })

  // ============================================
  // 4. HIERARCHICAL CATEGORIES
  // ============================================
  console.log('Creating categories...')

  const categories = [
    {
      name: 'Maquillaje',
      slug: 'maquillaje',
      description: 'Descubre nuestra amplia selección de maquillaje profesional para realzar tu belleza natural',
      imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800',
      isFeatured: true,
      sortOrder: 1,
      children: [
        { name: 'Labios', slug: 'labios', description: 'Labiales, gloss, bálsamos', imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800', sortOrder: 1 },
        { name: 'Rostro', slug: 'rostro', description: 'Bases, correctores, polvos, rubores', imageUrl: 'https://images.unsplash.com/photo-1631730486784-5ebe4b6bb0ea?auto=format&fit=crop&q=80&w=800', sortOrder: 2 },
        { name: 'Ojos', slug: 'ojos', description: 'Sombras, delineadores, máscaras, cejas', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=800', sortOrder: 3 },
        { name: 'Cejas', slug: 'cejas', description: 'Lápices, geles, pomadas para cejas perfectas', imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=800', sortOrder: 4 },
      ]
    },
    {
      name: 'Skincare',
      slug: 'skincare',
      description: 'Cuida tu piel con productos de alta calidad y resultados visibles',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800',
      isFeatured: true,
      sortOrder: 2,
      children: [
        { name: 'Limpiadores', slug: 'limpiadores', description: 'Limpiadores faciales, espumas, geles', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800', sortOrder: 1 },
        { name: 'Hidratantes', slug: 'hidratantes', description: 'Cremas faciales, lociones, emulsiones', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800', sortOrder: 2 },
        { name: 'Serums', slug: 'serums', description: 'Tratamientos concentrados para resultados específicos', imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=800', sortOrder: 3 },
        { name: 'Mascarillas', slug: 'mascarillas', description: 'Mascarillas faciales, tratamientos intensivos', imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=800', sortOrder: 4 },
        { name: 'Protección Solar', slug: 'proteccion-solar', description: 'Protectores solares faciales y corporales', imageUrl: 'https://images.unsplash.com/photo-1556228852-80f825a7f6bf?auto=format&fit=crop&q=80&w=800', sortOrder: 5 },
      ]
    },
    {
      name: 'Cabello',
      slug: 'cabello',
      description: 'Productos profesionales para el cuidado y styling del cabello',
      imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=800',
      isFeatured: true,
      sortOrder: 3,
      children: [
        { name: 'Shampoo', slug: 'shampoo', description: 'Limpieza profunda y suave', imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800', sortOrder: 1 },
        { name: 'Acondicionador', slug: 'acondicionador', description: 'Suavidad y brillo incomparable', imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=800', sortOrder: 2 },
        { name: 'Tratamientos', slug: 'tratamientos-capilares', description: 'Máscaras, ampollas, tratamientos reparadores', imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=800', sortOrder: 3 },
        { name: 'Styling', slug: 'styling', description: 'Sprays, geles, ceras para peinar', imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800', sortOrder: 4 },
      ]
    },
    {
      name: 'Fragancias',
      slug: 'fragancias',
      description: 'Perfumes y fragancias exclusivas para cada ocasión',
      imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
      isFeatured: true,
      sortOrder: 4,
      children: [
        { name: 'Perfumes Femeninos', slug: 'perfumes-femeninos', description: 'Fragancias elegantes para mujer', imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59370?auto=format&fit=crop&q=80&w=800', sortOrder: 1 },
        { name: 'Perfumes Masculinos', slug: 'perfumes-masculinos', description: 'Fragancias sofisticadas para hombre', imageUrl: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&q=80&w=800', sortOrder: 2 },
        { name: 'Body Mist', slug: 'body-mist', description: 'Fragancias ligeras para el día a día', imageUrl: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800', sortOrder: 3 },
      ]
    },
    {
      name: 'Cuidado Corporal',
      slug: 'cuidado-corporal',
      description: 'Productos para mimar tu cuerpo de pies a cabeza',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
      isFeatured: true,
      sortOrder: 5,
      children: [
        { name: 'Cremas Corporales', slug: 'cremas-corporales', description: 'Hidratación profunda', imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&q=80&w=800', sortOrder: 1 },
        { name: 'Exfoliantes', slug: 'exfoliantes', description: 'Scrubs y exfoliantes corporales', imageUrl: 'https://images.unsplash.com/photo-1590439471364-192aa70c3a71?auto=format&fit=crop&q=80&w=800', sortOrder: 2 },
        { name: 'Aceites Corporales', slug: 'aceites-corporales', description: 'Nutrición y suavidad extrema', imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800', sortOrder: 3 },
      ]
    },
    {
      name: 'Uñas',
      slug: 'unas',
      description: 'Todo para uñas perfectas y saludables',
      imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800',
      isFeatured: false,
      sortOrder: 6,
      children: [
        { name: 'Esmaltes', slug: 'esmaltes', description: 'Colores vibrantes y duraderos', imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=800', sortOrder: 1 },
        { name: 'Tratamientos', slug: 'tratamientos-unas', description: 'Fortalecedores, bases, top coats', imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=800', sortOrder: 2 },
      ]
    },
    {
      name: 'Accesorios',
      slug: 'accesorios',
      description: 'Herramientas y accesorios para tu rutina de belleza',
      imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800',
      isFeatured: false,
      sortOrder: 7,
      children: [
        { name: 'Brochas', slug: 'brochas', description: 'Brochas profesionales', imageUrl: 'https://images.unsplash.com/photo-1589915936950-e05296027b67?auto=format&fit=crop&q=80&w=800', sortOrder: 1 },
        { name: 'Esponjas', slug: 'esponjas', description: 'Esponjas y aplicadores', imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=800', sortOrder: 2 },
        { name: 'Organizadores', slug: 'organizadores', description: 'Organización y almacenamiento', imageUrl: 'https://images.unsplash.com/photo-1583241800698-4519d49b5001?auto=format&fit=crop&q=80&w=800', sortOrder: 3 },
      ]
    },
    {
      name: 'Sets y Kits',
      slug: 'sets-y-kits',
      description: 'Sets completos y gift sets perfectos para regalar',
      imageUrl: 'https://images.unsplash.com/photo-1608633722867-bf9ff6e6db82?auto=format&fit=crop&q=80&w=800',
      isFeatured: true,
      sortOrder: 8,
      children: [
        { name: 'Gift Sets', slug: 'gift-sets', description: 'Regalos perfectos', imageUrl: 'https://images.unsplash.com/photo-1549662443-e23e8e4c9e93?auto=format&fit=crop&q=80&w=800', sortOrder: 1 },
        { name: 'Travel Kits', slug: 'travel-kits', description: 'Tamaños ideales para viajar', imageUrl: 'https://images.unsplash.com/photo-1469451110939-0fd3a6b149eb?auto=format&fit=crop&q=80&w=800', sortOrder: 2 },
      ]
    },
  ]

  for (const cat of categories) {
    const { children, ...catData } = cat
    
    const categoriaPadre = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: {},
      create: catData,
    })

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
  // 5. ATTRIBUTES (EAV)
  // ============================================
  console.log('Creating attributes...')

  const attributes = [
    {
      name: 'color',
      displayName: 'Color',
      type: 'COLOR_HEX' as const,
      values: [
        { value: 'rojo-pasion', displayValue: 'Rojo Pasión', colorHex: '#DC143C' },
        { value: 'rosa-suave', displayValue: 'Rosa Suave', colorHex: '#FFB6C1' },
        { value: 'nude-natural', displayValue: 'Nude Natural', colorHex: '#D2B48C' },
        { value: 'coral-vivo', displayValue: 'Coral Vivo', colorHex: '#FF7F50' },
        { value: 'bordeaux', displayValue: 'Bordó', colorHex: '#800020' },
        { value: 'nude-rosado', displayValue: 'Nude Rosado', colorHex: '#E8B4B8' },
        { value: 'rojo-cereza', displayValue: 'Rojo Cereza', colorHex: '#990000' },
        { value: 'rosa-fucsia', displayValue: 'Rosa Fucsia', colorHex: '#FF00FF' },
        { value: 'negro', displayValue: 'Negro', colorHex: '#000000' },
        { value: 'marron', displayValue: 'Marrón', colorHex: '#8B4513' },
        { value: 'dorado', displayValue: 'Dorado', colorHex: '#FFD700' },
        { value: 'plateado', displayValue: 'Plateado', colorHex: '#C0C0C0' },
        { value: 'bronce', displayValue: 'Bronce', colorHex: '#CD7F32' },
        { value: 'azul-noche', displayValue: 'Azul Noche', colorHex: '#191970' },
        { value: 'verde-esmeralda', displayValue: 'Verde Esmeralda', colorHex: '#50C878' },
        { value: 'purpura', displayValue: 'Púrpura', colorHex: '#800080' },
        { value: 'transparente', displayValue: 'Transparente', colorHex: '#FFFFFF' },
      ]
    },
    {
      name: 'tamano',
      displayName: 'Tamaño',
      type: 'TEXT' as const,
      values: [
        { value: '30ml', displayValue: '30 ml' },
        { value: '50ml', displayValue: '50 ml' },
        { value: '100ml', displayValue: '100 ml' },
        { value: '150ml', displayValue: '150 ml' },
        { value: '200ml', displayValue: '200 ml' },
        { value: '250ml', displayValue: '250 ml' },
        { value: '300ml', displayValue: '300 ml' },
        { value: '500ml', displayValue: '500 ml' },
        { value: '1l', displayValue: '1 Litro' },
        { value: 'travel', displayValue: 'Tamaño Viaje (15-30ml)' },
        { value: 'regular', displayValue: 'Tamaño Regular' },
      ]
    },
    {
      name: 'acabado',
      displayName: 'Acabado',
      type: 'TEXT' as const,
      values: [
        { value: 'mate', displayValue: 'Mate' },
        { value: 'satinado', displayValue: 'Satinado' },
        { value: 'brillante', displayValue: 'Brillante' },
        { value: 'metalico', displayValue: 'Metálico' },
        { value: 'glitter', displayValue: 'Con Glitter' },
        { value: 'cremoso', displayValue: 'Cremoso' },
      ]
    },
    {
      name: 'tipo-piel',
      displayName: 'Tipo de Piel',
      type: 'TEXT' as const,
      values: [
        { value: 'todo-tipo', displayValue: 'Todo Tipo de Piel' },
        { value: 'grasa', displayValue: 'Piel Grasa' },
        { value: 'seca', displayValue: 'Piel Seca' },
        { value: 'mixta', displayValue: 'Piel Mixta' },
        { value: 'sensible', displayValue: 'Piel Sensible' },
        { value: 'normal', displayValue: 'Piel Normal' },
      ]
    },
    {
      name: 'tipo-cabello',
      displayName: 'Tipo de Cabello',
      type: 'TEXT' as const,
      values: [
        { value: 'todo-tipo', displayValue: 'Todo Tipo de Cabello' },
        { value: 'liso', displayValue: 'Cabello Liso' },
        { value: 'ondulado', displayValue: 'Cabello Ondulado' },
        { value: 'rizado', displayValue: 'Cabello Rizado' },
        { value: 'seco', displayValue: 'Cabello Seco' },
        { value: 'graso', displayValue: 'Cabello Graso' },
        { value: 'danado', displayValue: 'Cabello Dañado' },
      ]
    },
    {
      name: 'familia-olfativa',
      displayName: 'Familia Olfativa',
      type: 'TEXT' as const,
      values: [
        { value: 'floral', displayValue: 'Floral' },
        { value: 'frutal', displayValue: 'Frutal' },
        { value: 'citrico', displayValue: 'Cítrico' },
        { value: 'amaderado', displayValue: 'Amaderado' },
        { value: 'oriental', displayValue: 'Oriental' },
        { value: 'fresco', displayValue: 'Fresco' },
        { value: 'dulce', displayValue: 'Dulce' },
      ]
    },
  ]

  const attributeRecords: Record<string, any> = {}
  const attributeValueRecords: Record<string, Record<string, any>> = {}

  for (const attr of attributes) {
    const attribute = await prisma.attribute.upsert({
      where: { name: attr.name },
      update: {},
      create: {
        name: attr.name,
        displayName: attr.displayName,
        type: attr.type,
      },
    })
    
    attributeRecords[attr.name] = attribute
    attributeValueRecords[attr.name] = {}

    for (const val of attr.values) {
      const attribValue = await prisma.attributeValue.upsert({
        where: {
          attributeId_value: {
            attributeId: attribute.id,
            value: val.value,
          },
        },
        update: {},
        create: {
          attributeId: attribute.id,
          value: val.value,
          displayValue: val.displayValue,
          colorHex: val.colorHex || null,
        },
      })
      
      attributeValueRecords[attr.name][val.value] = attribValue
    }
  }

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
