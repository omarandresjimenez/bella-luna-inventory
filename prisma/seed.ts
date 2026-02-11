import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {


  // ============================================
  // 1. USUARIO ADMIN
  // ============================================

  
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


  const categorias = [
    {
      name: 'Maquillaje',
      slug: 'maquillaje',
      description: 'Todo para tu look perfecto',
      imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=75&w=800',
      isFeatured: true,
      sortOrder: 1,
      children: [
        { name: 'Labios', slug: 'labios', description: 'Labiales, gloss y más', imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=75&w=800', sortOrder: 1 },
        { name: 'Rostro', slug: 'rostro', description: 'Bases, correctores y polvos', imageUrl: 'https://images.unsplash.com/photo-1631730486784-5ebe4b6bb0ea?auto=format&fit=crop&q=75&w=800', sortOrder: 2 },
        { name: 'Ojos', slug: 'ojos', description: 'Sombras, delineadores y máscaras', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=75&w=800', sortOrder: 3 },
      ]
    },
    {
      name: 'Skincare',
      slug: 'skincare',
      description: 'Cuidado de la piel',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=75&w=800',
      isFeatured: true,
      sortOrder: 2,
      children: [
        { name: 'Limpiadores', slug: 'limpiadores', description: 'Limpieza facial', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=75&w=800', sortOrder: 1 },
        { name: 'Hidratantes', slug: 'hidratantes', description: 'Cremas y serums', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=75&w=800', sortOrder: 2 },
        { name: 'Tratamientos', slug: 'tratamientos-faciales', description: 'Mascarillas y tratamientos específicos', imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=75&w=800', sortOrder: 3 },
      ]
    },
    {
      name: 'Cabello',
      slug: 'cabello',
      description: 'Cuidado capilar',
      imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=75&w=800',
      isFeatured: false,
      sortOrder: 3,
      children: [
        { name: 'Shampoo', slug: 'shampoo', description: 'Limpieza capilar', imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=75&w=800', sortOrder: 1 },
        { name: 'Acondicionador', slug: 'acondicionador', description: 'Suavidad y brillo', imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=75&w=800', sortOrder: 2 },
        { name: 'Tratamientos', slug: 'tratamientos-capilares', description: 'Reparación y nutrición', imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=75&w=800', sortOrder: 3 },
      ]
    },
    {
      name: 'Fragancias',
      slug: 'fragancias',
      description: 'Perfumes y colonias',
      imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=75&w=800',
      isFeatured: true,
      sortOrder: 4,
      children: []
    },
    {
      name: 'Uñas',
      slug: 'unas',
      description: 'Esmaltes y cuidado de uñas',
      imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=75&w=800',
      isFeatured: false,
      sortOrder: 5,
      children: []
    },
    {
      name: 'Accesorios',
      slug: 'accesorios',
      description: 'Brochas, esponjas y más',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=75&w=800',
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
        { value: 'negro', displayValue: 'Negro', colorHex: '#000000' },
        { value: 'azul-noche', displayValue: 'Azul Noche', colorHex: '#191970' },
        { value: 'verde-esmeralda', displayValue: 'Verde Esmeralda', colorHex: '#50C878' },
        { value: 'purpura', displayValue: 'Púrpura', colorHex: '#800080' },
        { value: 'dorado', displayValue: 'Dorado', colorHex: '#FFD700' },
        { value: 'plateado', displayValue: 'Plateado', colorHex: '#C0C0C0' },
        { value: 'bronce', displayValue: 'Bronce', colorHex: '#CD7F32' },
        { value: 'marron', displayValue: 'Marrón', colorHex: '#8B4513' },
      ]
    },
    {
      name: 'tamaño',
      displayName: 'Tamaño',
      type: 'TEXT' as const,
      values: [
        { value: '10ml', displayValue: '10 ml' },
        { value: '15ml', displayValue: '15 ml' },
        { value: '30ml', displayValue: '30 ml' },
        { value: '50ml', displayValue: '50 ml' },
        { value: '100ml', displayValue: '100 ml' },
        { value: '200ml', displayValue: '200 ml' },
        { value: 's', displayValue: 'Pequeño (S)' },
        { value: 'm', displayValue: 'Mediano (M)' },
        { value: 'l', displayValue: 'Grande (L)' },
        { value: 'xl', displayValue: 'Extra Grande (XL)' },
        { value: 'travel', displayValue: 'Tamaño Viaje' },
        { value: 'regular', displayValue: 'Tamaño Regular' },
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
        { value: 'spray', displayValue: 'Spray' },
        { value: 'stick', displayValue: 'Stick' },
      ]
    },
    {
      name: 'tipo-piel',
      displayName: 'Tipo de Piel',
      type: 'TEXT' as const,
      values: [
        { value: 'grasa', displayValue: 'Grasa' },
        { value: 'seca', displayValue: 'Seca' },
        { value: 'mixta', displayValue: 'Mixta' },
        { value: 'sensible', displayValue: 'Sensible' },
        { value: 'normal', displayValue: 'Normal' },
        { value: 'todos', displayValue: 'Todos los tipos' },
      ]
    },
    {
      name: 'acabado',
      displayName: 'Acabado',
      type: 'TEXT' as const,
      values: [
        { value: 'mate', displayValue: 'Mate' },
        { value: 'brillante', displayValue: 'Brillante' },
        { value: 'satinado', displayValue: 'Satinado' },
        { value: 'natural', displayValue: 'Natural' },
        { value: 'glossy', displayValue: 'Glossy' },
        { value: 'metalico', displayValue: 'Metálico' },
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
  // 5. PRODUCTOS CON IMÁGENES Y VARIANTES
  // ============================================

  // Obtener categorías
  const catLabios = await prisma.category.findUnique({ where: { slug: 'labios' } })
  const catRostro = await prisma.category.findUnique({ where: { slug: 'rostro' } })
  const catOjos = await prisma.category.findUnique({ where: { slug: 'ojos' } })
  const catLimpiadores = await prisma.category.findUnique({ where: { slug: 'limpiadores' } })
  const catHidratantes = await prisma.category.findUnique({ where: { slug: 'hidratantes' } })
  const catTratamientosFacial = await prisma.category.findUnique({ where: { slug: 'tratamientos-faciales' } })
  const catShampoo = await prisma.category.findUnique({ where: { slug: 'shampoo' } })
  const catAcondicionador = await prisma.category.findUnique({ where: { slug: 'acondicionador' } })
  const catTratamientosCapilar = await prisma.category.findUnique({ where: { slug: 'tratamientos-capilares' } })
  const catFragancias = await prisma.category.findUnique({ where: { slug: 'fragancias' } })
  const catUnas = await prisma.category.findUnique({ where: { slug: 'unas' } })
  const catAccesorios = await prisma.category.findUnique({ where: { slug: 'accesorios' } })
  
  // Obtener atributos
  const attrColor = await prisma.attribute.findUnique({ where: { name: 'color' } })
  const attrTamaño = await prisma.attribute.findUnique({ where: { name: 'tamaño' } })
  const attrPresentacion = await prisma.attribute.findUnique({ where: { name: 'presentacion' } })
  const attrTipoPiel = await prisma.attribute.findUnique({ where: { name: 'tipo-piel' } })
  const attrAcabado = await prisma.attribute.findUnique({ where: { name: 'acabado' } })
  
  // Obtener valores de atributos
  const valoresColor = await prisma.attributeValue.findMany({ where: { attributeId: attrColor!.id } })
  const valoresTamaño = await prisma.attributeValue.findMany({ where: { attributeId: attrTamaño!.id } })
  const valoresPresentacion = await prisma.attributeValue.findMany({ where: { attributeId: attrPresentacion!.id } })
  const valoresTipoPiel = await prisma.attributeValue.findMany({ where: { attributeId: attrTipoPiel!.id } })
  const valoresAcabado = await prisma.attributeValue.findMany({ where: { attributeId: attrAcabado!.id } })

  // Helper function to create product images
  const createProductImages = async (productId: string, imageUrls: string[]) => {
    for (let i = 0; i < imageUrls.length; i++) {
      await prisma.productImage.create({
        data: {
          productId,
          originalPath: imageUrls[i],
          thumbnailUrl: imageUrls[i],
          smallUrl: imageUrls[i],
          mediumUrl: imageUrls[i],
          largeUrl: imageUrls[i],
          altText: `Product image ${i + 1}`,
          sortOrder: i,
          isPrimary: i === 0,
        },
      })
    }
  }

  // Helper function to create variants with colors
  const createColorVariants = async (productId: string, colors: any[], baseCost: number, basePrice: number) => {
    for (const color of colors) {
      const variant = await prisma.productVariant.create({
        data: {
          productId,
          cost: baseCost,
          price: basePrice,
          stock: Math.floor(Math.random() * 50) + 20,
          isActive: true,
        },
      })

      await prisma.variantAttributeValue.create({
        data: {
          variantId: variant.id,
          attributeValueId: color.id,
        },
      })
    }
  }

  // Helper function to create variants with sizes
  const createSizeVariants = async (productId: string, sizes: any[], baseCost: number, basePrice: number) => {
    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i]
      const priceMultiplier = i === 0 ? 0.8 : i === 1 ? 1 : i === 2 ? 1.3 : 1.6
      
      const variant = await prisma.productVariant.create({
        data: {
          productId,
          cost: Math.round(baseCost * priceMultiplier),
          price: Math.round(basePrice * priceMultiplier),
          stock: Math.floor(Math.random() * 50) + 20,
          isActive: true,
        },
      })

      await prisma.variantAttributeValue.create({
        data: {
          variantId: variant.id,
          attributeValueId: size.id,
        },
      })
    }
  }

  // ==================== MAQUILLAJE - LABIOS ====================

  // Producto 1: Labial Líquido Matte
  const producto1 = await prisma.product.upsert({
    where: { sku: 'LAB-MAT-001' },
    update: {},
    create: {
      sku: 'LAB-MAT-001',
      name: 'Labial Líquido Matte Longwear',
      description: 'Labial líquido de larga duración con acabado mate. No transfiere, hidrata tus labios y dura hasta 12 horas.',
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

  await prisma.productCategory.createMany({
    data: [{ productId: producto1.id, categoryId: catLabios!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto1.id, attributeId: attrColor!.id },
      { productId: producto1.id, attributeId: attrTamaño!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto1.id, [
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&q=75&w=800',
  ])

  await createColorVariants(producto1.id, valoresColor.slice(0, 6), 15000, 35000)

  // Producto 2: Gloss Hidratante
  const producto2 = await prisma.product.upsert({
    where: { sku: 'LAB-GLO-002' },
    update: {},
    create: {
      sku: 'LAB-GLO-002',
      name: 'Gloss Labial Ultra Shine',
      description: 'Gloss labial con efecto voluminizador y alto brillo. Hidrata profundamente con aceite de argán y vitamina E.',
      brand: 'Bella Luna Pro',
      slug: 'gloss-labial-ultra-shine',
      baseCost: 12000,
      basePrice: 28000,
      discountPercent: 10,
      trackStock: true,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto2.id, categoryId: catLabios!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto2.id, attributeId: attrColor!.id },
      { productId: producto2.id, attributeId: attrTamaño!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto2.id, [
    'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=75&w=800',
  ])

  await createColorVariants(producto2.id, valoresColor.slice(2, 8), 12000, 28000)

  // ==================== MAQUILLAJE - ROSTRO ====================

  // Producto 3: Base Líquida
  const producto3 = await prisma.product.upsert({
    where: { sku: 'BASE-LIQ-003' },
    update: {},
    create: {
      sku: 'BASE-LIQ-003',
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
    data: [{ productId: producto3.id, categoryId: catRostro!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto3.id, attributeId: attrTamaño!.id },
      { productId: producto3.id, attributeId: attrTipoPiel!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto3.id, [
    'https://images.unsplash.com/photo-1631730486784-5ebe4b6bb0ea?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=75&w=800',
  ])

  await createSizeVariants(producto3.id, valoresTamaño.slice(1, 4), 25000, 55000)

  // Producto 4: Polvo Compacto
  const producto4 = await prisma.product.upsert({
    where: { sku: 'POL-COM-004' },
    update: {},
    create: {
      sku: 'POL-COM-004',
      name: 'Polvo Compacto Matificante',
      description: 'Polvo compacto que controla el brillo y fija el maquillaje. Acabado mate natural.',
      brand: 'Bella Luna Pro',
      slug: 'polvo-compacto-matificante',
      baseCost: 18000,
      basePrice: 42000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: false,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto4.id, categoryId: catRostro!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto4.id, attributeId: attrColor!.id },
      { productId: producto4.id, attributeId: attrAcabado!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto4.id, [
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=75&w=800',
  ])

  await createColorVariants(producto4.id, valoresColor.slice(8, 12), 18000, 42000)

  // ==================== MAQUILLAJE - OJOS ====================

  // Producto 5: Paleta de Sombras
  const producto5 = await prisma.product.upsert({
    where: { sku: 'SOM-PAL-005' },
    update: {},
    create: {
      sku: 'SOM-PAL-005',
      name: 'Paleta de Sombras 12 Colores',
      description: 'Paleta con 12 sombras de alta pigmentación. Tonos mate y shimmer para looks de día y noche.',
      brand: 'Bella Luna Pro',
      slug: 'paleta-sombras-12-colores',
      baseCost: 35000,
      basePrice: 75000,
      discountPercent: 15,
      trackStock: true,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto5.id, categoryId: catOjos!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto5.id, attributeId: attrPresentacion!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto5.id, [
    'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=75&w=800',
  ])

  // Producto 6: Delineador Líquido
  const producto6 = await prisma.product.upsert({
    where: { sku: 'DEL-LIQ-006' },
    update: {},
    create: {
      sku: 'DEL-LIQ-006',
      name: 'Delineador Líquido Precisión',
      description: 'Delineador líquido con punta fina para máxima precisión. Resistente al agua y de larga duración.',
      brand: 'Bella Luna Pro',
      slug: 'delineador-liquido-precision',
      baseCost: 12000,
      basePrice: 28000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: false,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto6.id, categoryId: catOjos!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto6.id, attributeId: attrColor!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto6.id, [
    'https://images.unsplash.com/photo-1631214524115-6f8eb1beb6c5?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=75&w=800',
  ])

  await createColorVariants(producto6.id, [valoresColor[8], valoresColor[9]], 12000, 28000)

  // ==================== SKINCARE - LIMPIADORES ====================

  // Producto 7: Gel Limpiador Facial
  const producto7 = await prisma.product.upsert({
    where: { sku: 'LIM-GEL-007' },
    update: {},
    create: {
      sku: 'LIM-GEL-007',
      name: 'Gel Limpiador Facial Purificante',
      description: 'Gel limpiador suave que elimina impurezas y maquillaje. Con té verde y ácido salicílico.',
      brand: 'Bella Luna Skin',
      slug: 'gel-limpiador-facial-purificante',
      baseCost: 18000,
      basePrice: 42000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto7.id, categoryId: catLimpiadores!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto7.id, attributeId: attrTamaño!.id },
      { productId: producto7.id, attributeId: attrTipoPiel!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto7.id, [
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=75&w=800',
  ])

  await createSizeVariants(producto7.id, valoresTamaño.slice(2, 5), 18000, 42000)

  // Producto 8: Agua Micelar
  const producto8 = await prisma.product.upsert({
    where: { sku: 'LIM-MIC-008' },
    update: {},
    create: {
      sku: 'LIM-MIC-008',
      name: 'Agua Micelar Desmaquillante',
      description: 'Agua micelar 3 en 1: limpia, desmaquilla y tonifica. Sin alcohol, ideal para piel sensible.',
      brand: 'Bella Luna Skin',
      slug: 'agua-micelar-desmaquillante',
      baseCost: 15000,
      basePrice: 35000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: false,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto8.id, categoryId: catLimpiadores!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto8.id, attributeId: attrTamaño!.id },
      { productId: producto8.id, attributeId: attrTipoPiel!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto8.id, [
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&q=75&w=800',
  ])

  await createSizeVariants(producto8.id, [valoresTamaño[3], valoresTamaño[4]], 15000, 35000)

  // ==================== SKINCARE - HIDRATANTES ====================

  // Producto 9: Sérum Hidratante
  const producto9 = await prisma.product.upsert({
    where: { sku: 'SER-HID-009' },
    update: {},
    create: {
      sku: 'SER-HID-009',
      name: 'Sérum Hidratante Ácido Hialurónico',
      description: 'Sérum concentrado con ácido hialurónico para hidración profunda. Reduce líneas finas y mejora la elasticidad.',
      brand: 'Bella Luna Skin',
      slug: 'serum-hidratante-acido-hialuronico',
      baseCost: 35000,
      basePrice: 75000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto9.id, categoryId: catHidratantes!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto9.id, attributeId: attrTamaño!.id },
      { productId: producto9.id, attributeId: attrTipoPiel!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto9.id, [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=75&w=800',
  ])

  await createSizeVariants(producto9.id, valoresTamaño.slice(2, 4), 35000, 75000)

  // Producto 10: Crema Hidratante
  const producto10 = await prisma.product.upsert({
    where: { sku: 'CRE-HID-010' },
    update: {},
    create: {
      sku: 'CRE-HID-010',
      name: 'Crema Hidratante 24H',
      description: 'Crema hidratante de larga duración con ceramidas y niacinamida. Recupera la barrera cutánea.',
      brand: 'Bella Luna Skin',
      slug: 'crema-hidratante-24h',
      baseCost: 28000,
      basePrice: 65000,
      discountPercent: 10,
      trackStock: true,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto10.id, categoryId: catHidratantes!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto10.id, attributeId: attrTamaño!.id },
      { productId: producto10.id, attributeId: attrTipoPiel!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto10.id, [
    'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=75&w=800',
  ])

  await createSizeVariants(producto10.id, [valoresTamaño[3], valoresTamaño[4]], 28000, 65000)

  // ==================== SKINCARE - TRATAMIENTOS ====================

  // Producto 11: Mascarilla Facial
  const producto11 = await prisma.product.upsert({
    where: { sku: 'MAS-ARC-011' },
    update: {},
    create: {
      sku: 'MAS-ARC-011',
      name: 'Mascarilla de Arcilla Purificante',
      description: 'Mascarilla de arcilla blanca que absorbe el exceso de grasa y minimiza los poros. Con extracto de té verde.',
      brand: 'Bella Luna Skin',
      slug: 'mascarilla-arcilla-purificante',
      baseCost: 20000,
      basePrice: 45000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: false,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto11.id, categoryId: catTratamientosFacial!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto11.id, attributeId: attrTamaño!.id },
      { productId: producto11.id, attributeId: attrTipoPiel!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto11.id, [
    'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=75&w=800',
  ])

  await createSizeVariants(producto11.id, [valoresTamaño[3], valoresTamaño[5]], 20000, 45000)

  // Producto 12: Exfoliante Facial
  const producto12 = await prisma.product.upsert({
    where: { sku: 'EXF-ENZ-012' },
    update: {},
    create: {
      sku: 'EXF-ENZ-012',
      name: 'Exfoliante Enzimático Suave',
      description: 'Exfoliante enzimático que elimina células muertas sin fricción. Ideal para piel sensible.',
      brand: 'Bella Luna Skin',
      slug: 'exfoliante-enzimatico-suave',
      baseCost: 32000,
      basePrice: 68000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: false,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto12.id, categoryId: catTratamientosFacial!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto12.id, attributeId: attrTamaño!.id },
      { productId: producto12.id, attributeId: attrTipoPiel!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto12.id, [
    'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=75&w=800',
  ])

  await createSizeVariants(producto12.id, [valoresTamaño[2], valoresTamaño[3]], 32000, 68000)

  // ==================== CABELLO - SHAMPOO ====================

  // Producto 13: Shampoo Hidratante
  const producto13 = await prisma.product.upsert({
    where: { sku: 'SHAM-HID-013' },
    update: {},
    create: {
      sku: 'SHAM-HID-013',
      name: 'Shampoo Hidratante Reparador',
      description: 'Shampoo con aceite de argán y queratina que repara y fortalece el cabello seco y dañado.',
      brand: 'Bella Luna Hair',
      slug: 'shampoo-hidratante-reparador',
      baseCost: 22000,
      basePrice: 48000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto13.id, categoryId: catShampoo!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto13.id, attributeId: attrTamaño!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto13.id, [
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=75&w=800',
  ])

  await createSizeVariants(producto13.id, [valoresTamaño[4], valoresTamaño[5]], 22000, 48000)

  // Producto 14: Shampoo Anticaspa
  const producto14 = await prisma.product.upsert({
    where: { sku: 'SHAM-ANT-014' },
    update: {},
    create: {
      sku: 'SHAM-ANT-014',
      name: 'Shampoo Anticaspa Control',
      description: 'Shampoo con zinc y aloe vera que controla la caspa y calma el cuero cabelludo irritado.',
      brand: 'Bella Luna Hair',
      slug: 'shampoo-anticaspa-control',
      baseCost: 24000,
      basePrice: 52000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: false,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto14.id, categoryId: catShampoo!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto14.id, attributeId: attrTamaño!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto14.id, [
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=75&w=800',
  ])

  await createSizeVariants(producto14.id, [valoresTamaño[4], valoresTamaño[5]], 24000, 52000)

  // ==================== CABELLO - ACONDICIONADOR ====================

  // Producto 15: Acondicionador Hidratante
  const producto15 = await prisma.product.upsert({
    where: { sku: 'ACO-HID-015' },
    update: {},
    create: {
      sku: 'ACO-HID-015',
      name: 'Acondicionador Hidratante Intenso',
      description: 'Acondicionador que desenreda, suaviza y da brillo al cabello. Con aceite de coco y manteca de karité.',
      brand: 'Bella Luna Hair',
      slug: 'acondicionador-hidratante-intenso',
      baseCost: 22000,
      basePrice: 48000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto15.id, categoryId: catAcondicionador!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto15.id, attributeId: attrTamaño!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto15.id, [
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=75&w=800',
  ])

  await createSizeVariants(producto15.id, [valoresTamaño[4], valoresTamaño[5]], 22000, 48000)

  // Producto 16: Acondicionador Reparador
  const producto16 = await prisma.product.upsert({
    where: { sku: 'ACO-REP-016' },
    update: {},
    create: {
      sku: 'ACO-REP-016',
      name: 'Acondicionador Reparador Proteínas',
      description: 'Acondicionador con proteínas de seda y queratina que repara puntas abiertas y fortalece la fibra capilar.',
      brand: 'Bella Luna Hair',
      slug: 'acondicionador-reparador-proteinas',
      baseCost: 26000,
      basePrice: 55000,
      discountPercent: 10,
      trackStock: true,
      isActive: true,
      isFeatured: false,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto16.id, categoryId: catAcondicionador!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto16.id, attributeId: attrTamaño!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto16.id, [
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=75&w=800',
  ])

  await createSizeVariants(producto16.id, [valoresTamaño[4], valoresTamaño[5]], 26000, 55000)

  // ==================== CABELLO - TRATAMIENTOS ====================

  // Producto 17: Mascarilla Capilar
  const producto17 = await prisma.product.upsert({
    where: { sku: 'MASC-CAP-017' },
    update: {},
    create: {
      sku: 'MASC-CAP-017',
      name: 'Mascarilla Capilar Nutrición Profunda',
      description: 'Mascarilla intensiva que nutre y repara el cabello dañado. Con aceite de argán y macadamia.',
      brand: 'Bella Luna Hair',
      slug: 'mascarilla-capilar-nutricion-profunda',
      baseCost: 28000,
      basePrice: 62000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto17.id, categoryId: catTratamientosCapilar!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto17.id, attributeId: attrTamaño!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto17.id, [
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=75&w=800',
  ])

  await createSizeVariants(producto17.id, [valoresTamaño[3], valoresTamaño[4]], 28000, 62000)

  // Producto 18: Serum Capilar
  const producto18 = await prisma.product.upsert({
    where: { sku: 'SER-CAP-018' },
    update: {},
    create: {
      sku: 'SER-CAP-018',
      name: 'Sérum Capilar Reparador Puntas',
      description: 'Sérum que sella las puntas abiertas y protege el cabello del calor. Con aceite de jojoba y vitamina E.',
      brand: 'Bella Luna Hair',
      slug: 'serum-capilar-reparador-puntas',
      baseCost: 30000,
      basePrice: 68000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: false,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto18.id, categoryId: catTratamientosCapilar!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto18.id, attributeId: attrTamaño!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto18.id, [
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=75&w=800',
  ])

  await createSizeVariants(producto18.id, [valoresTamaño[2], valoresTamaño[3]], 30000, 68000)

  // ==================== FRAGANCIAS ====================

  // Producto 19: Perfume Floral
  const producto19 = await prisma.product.upsert({
    where: { sku: 'PER-FLO-019' },
    update: {},
    create: {
      sku: 'PER-FLO-019',
      name: 'Eau de Parfum Floral Elegance',
      description: 'Fragancia floral con notas de rosa, jazmín y peonía. Un aroma sofisticado y femenino que perdura todo el día.',
      brand: 'Bella Luna Essence',
      slug: 'eau-parfum-floral-elegance',
      baseCost: 85000,
      basePrice: 185000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto19.id, categoryId: catFragancias!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto19.id, attributeId: attrTamaño!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto19.id, [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=75&w=800',
  ])

  await createSizeVariants(producto19.id, [valoresTamaño[3], valoresTamaño[4]], 85000, 185000)

  // Producto 20: Perfume Oriental
  const producto20 = await prisma.product.upsert({
    where: { sku: 'PER-ORI-020' },
    update: {},
    create: {
      sku: 'PER-ORI-020',
      name: 'Eau de Parfum Oriental Mystery',
      description: 'Fragancia oriental intensa con notas de vainilla, ámbar y sándalo. Sensual y misteriosa.',
      brand: 'Bella Luna Essence',
      slug: 'eau-parfum-oriental-mystery',
      baseCost: 95000,
      basePrice: 195000,
      discountPercent: 10,
      trackStock: true,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto20.id, categoryId: catFragancias!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto20.id, attributeId: attrTamaño!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto20.id, [
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=75&w=800',
  ])

  await createSizeVariants(producto20.id, [valoresTamaño[3], valoresTamaño[4]], 95000, 195000)

  // ==================== UÑAS ====================

  // Producto 21: Esmalte Gel
  const producto21 = await prisma.product.upsert({
    where: { sku: 'ESM-GEL-021' },
    update: {},
    create: {
      sku: 'ESM-GEL-021',
      name: 'Esmalte Gel Uña Perfecta',
      description: 'Esmalte gel de larga duración con acabado profesional. Hasta 14 días de color intenso y brillo.',
      brand: 'Bella Luna Nails',
      slug: 'esmalte-gel-unia-perfecta',
      baseCost: 12000,
      basePrice: 28000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto21.id, categoryId: catUnas!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto21.id, attributeId: attrColor!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto21.id, [
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=75&w=800',
  ])

  await createColorVariants(producto21.id, valoresColor.slice(0, 10), 12000, 28000)

  // Producto 22: Kit Manicura
  const producto22 = await prisma.product.upsert({
    where: { sku: 'KIT-MAN-022' },
    update: {},
    create: {
      sku: 'KIT-MAN-022',
      name: 'Kit Completo de Manicura',
      description: 'Kit profesional con todo lo necesario para una manicura perfecta: lima, cortaúñas, empujador de cutículas y más.',
      brand: 'Bella Luna Nails',
      slug: 'kit-completo-manicura',
      baseCost: 35000,
      basePrice: 75000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: false,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto22.id, categoryId: catUnas!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto22.id, attributeId: attrColor!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto22.id, [
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=75&w=800',
  ])

  await createColorVariants(producto22.id, [valoresColor[12], valoresColor[13]], 35000, 75000)

  // ==================== ACCESORIOS ====================

  // Producto 23: Set Brochas
  const producto23 = await prisma.product.upsert({
    where: { sku: 'SET-BRO-023' },
    update: {},
    create: {
      sku: 'SET-BRO-023',
      name: 'Set de Brochas Profesionales 12 Piezas',
      description: 'Set completo de 12 brochas de alta calidad con cerdas sintéticas suaves. Incluye estuche elegante.',
      brand: 'Bella Luna Tools',
      slug: 'set-brochas-profesionales-12-piezas',
      baseCost: 45000,
      basePrice: 95000,
      discountPercent: 15,
      trackStock: true,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto23.id, categoryId: catAccesorios!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto23.id, attributeId: attrColor!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto23.id, [
    'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=75&w=800',
  ])

  await createColorVariants(producto23.id, [valoresColor[12], valoresColor[13], valoresColor[14]], 45000, 95000)

  // Producto 24: Esponjas Maquillaje
  const producto24 = await prisma.product.upsert({
    where: { sku: 'ESP-MAQ-024' },
    update: {},
    create: {
      sku: 'ESP-MAQ-024',
      name: 'Esponjas de Maquillaje Beauty Blender',
      description: 'Set de 3 esponjas de maquillaje sin látex para aplicar base y corrector de forma uniforme.',
      brand: 'Bella Luna Tools',
      slug: 'esponjas-maquillaje-beauty-blender',
      baseCost: 18000,
      basePrice: 38000,
      discountPercent: 0,
      trackStock: true,
      isActive: true,
      isFeatured: false,
    },
  })

  await prisma.productCategory.createMany({
    data: [{ productId: producto24.id, categoryId: catAccesorios!.id }],
    skipDuplicates: true,
  })

  await prisma.productAttribute.createMany({
    data: [
      { productId: producto24.id, attributeId: attrColor!.id },
    ],
    skipDuplicates: true,
  })

  await createProductImages(producto24.id, [
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=75&w=800',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=75&w=800',
  ])

  await createColorVariants(producto24.id, [valoresColor[0], valoresColor[2], valoresColor[8]], 18000, 38000)

  console.log('✅ Seed completado exitosamente!')
  console.log('📦 Productos creados: 24')
  console.log('🖼️ Imágenes: 2 por producto (48 total)')
  console.log('🎨 Variantes con colores/tamaños: Todas las categorías')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
