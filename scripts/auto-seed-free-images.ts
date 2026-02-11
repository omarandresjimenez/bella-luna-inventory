import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// Free image URLs from Unsplash (these are direct download URLs)
const FREE_IMAGES = {
  products: [
    {
      slug: 'base-liquida-cobertura-total',
      name: 'Base Líquida Cobertura Total',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200',
      altText: 'Base líquida maquillaje - Foundation makeup product'
    },
    {
      slug: 'labial-liquido-matte-longwear',
      name: 'Labial Líquido Matte Longwear',
      imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=1200',
      altText: 'Labial líquido matte - Liquid lipstick product'
    },
    {
      slug: 'serum-hidratante-acido-hialuronico',
      name: 'Sérum Hidratante Ácido Hialurónico',
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200',
      altText: 'Sérum hidratante facial - Hydrating face serum'
    }
  ],
  categories: [
    { slug: 'maquillaje', imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200' },
    { slug: 'skincare', imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200' },
    { slug: 'cabello', imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=1200' },
    { slug: 'fragancias', imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200' },
    { slug: 'labios', imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=1200' },
    { slug: 'rostro', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200' },
    { slug: 'ojos', imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200' },
    { slug: 'accesorios', imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200' },
    { slug: 'hidratantes', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200' },
    { slug: 'limpiadores', imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1200' },
    { slug: 'tratamientos-capilares', imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=1200' },
    { slug: 'tratamientos-faciales', imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200' },
    { slug: 'shampoo', imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=1200' },
    { slug: 'acondicionador', imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=1200' },
    { slug: 'unas', imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200' }
  ]
};

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {




  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const STORAGE_BUCKET = 'product-images';

async function downloadImage(url: string): Promise<Buffer> {
  console.log(`  📥 Downloading from ${url.substring(0, 60)}...`);
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  return Buffer.from(response.data);
}

async function uploadToSupabase(buffer: Buffer, path: string): Promise<string> {
  const { data, error } = await supabase
    .storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase
    .storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);

  return publicUrl;
}

async function seedProductImages() {
  console.log('\n' + '='.repeat(80));

  console.log('='.repeat(80));

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const productData of FREE_IMAGES.products) {
    try {
      // Find product in database
      const product = await prisma.product.findUnique({
        where: { slug: productData.slug }
      });

      if (!product) {

        skipCount++;
        continue;
      }

      // Check if product already has images
      const existingImages = await prisma.productImage.count({
        where: { productId: product.id }
      });

      if (existingImages > 0) {
        console.log(`⏭️  Skipping (already has images): ${productData.name}`);
        skipCount++;
        continue;
      }



      // Download image
      const imageBuffer = await downloadImage(productData.imageUrl);
      console.log(`  ✅ Downloaded (${(imageBuffer.length / 1024).toFixed(1)} KB)`);

      // Generate storage path
      const uniqueId = uuidv4();
      const storagePath = `${product.id}/${uniqueId}.jpg`;

      // Upload to Supabase
      const publicUrl = await uploadToSupabase(imageBuffer, storagePath);


      // Generate all image sizes
      const imageUrls = {
        original: publicUrl,
        thumbnail: `${publicUrl}?width=150&height=150&fit=cover`,
        small: `${publicUrl}?width=300&height=300&fit=cover`,
        medium: `${publicUrl}?width=600&height=600&fit=cover`,
        large: `${publicUrl}?width=1200&height=1200&fit=cover`,
      };

      // Create image record
      await prisma.productImage.create({
        data: {
          productId: product.id,
          originalPath: storagePath,
          thumbnailUrl: imageUrls.thumbnail,
          smallUrl: imageUrls.small,
          mediumUrl: imageUrls.medium,
          largeUrl: imageUrls.large,
          altText: productData.altText,
          isPrimary: true,
          sortOrder: 0,
        }
      });


      successCount++;

    } catch (error) {

      errorCount++;
    }
  }

  return { successCount, skipCount, errorCount };
}

async function seedCategoryImages() {
  console.log('\n' + '='.repeat(80));

  console.log('='.repeat(80));

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const categoryData of FREE_IMAGES.categories) {
    try {
      // Find category in database
      const category = await prisma.category.findUnique({
        where: { slug: categoryData.slug }
      });

      if (!category) {

        skipCount++;
        continue;
      }

      // Check if category already has an image
      if (category.imageUrl) {
        console.log(`⏭️  Skipping (already has image): ${category.name}`);
        skipCount++;
        continue;
      }



      // Download image
      const imageBuffer = await downloadImage(categoryData.imageUrl);
      console.log(`  ✅ Downloaded (${(imageBuffer.length / 1024).toFixed(1)} KB)`);

      // Generate storage path
      const uniqueId = uuidv4();
      const storagePath = `categories/${category.slug}-${uniqueId}.jpg`;

      // Upload to Supabase
      const publicUrl = await uploadToSupabase(imageBuffer, storagePath);


      // Update category with image URL
      await prisma.category.update({
        where: { id: category.id },
        data: { imageUrl: publicUrl }
      });


      successCount++;

    } catch (error) {

      errorCount++;
    }
  }

  return { successCount, skipCount, errorCount };
}

async function main() {

  console.log('='.repeat(80));







  try {
    // Seed product images
    const productResults = await seedProductImages();
    
    // Seed category images
    const categoryResults = await seedCategoryImages();

    // Summary
    console.log('\n' + '='.repeat(80));

    console.log('='.repeat(80));












  } catch (error) {

    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
