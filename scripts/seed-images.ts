import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const STORAGE_BUCKET = 'product-images';
const SEED_IMAGES_DIR = './seed-images';

interface ImageMapping {
  fileName: string;
  productSlug?: string;
  categorySlug?: string;
  altText?: string;
}

async function main() {

  console.log('='.repeat(80));

  // Check if seed-images directory exists
  if (!existsSync(SEED_IMAGES_DIR)) {





    console.log('   - Products: product-{slug}.jpg (e.g., product-collar-oro.jpg)');
    console.log('   - Categories: category-{slug}.jpg (e.g., category-joyeria.jpg)');

    process.exit(1);
  }

  // Read all files in seed-images directory
  const files = readdirSync(SEED_IMAGES_DIR).filter(file => 
    file.match(/\.(jpg|jpeg|png|webp)$/i)
  );

  if (files.length === 0) {

    console.log('\n📋 Please add image files (.jpg, .jpeg, .png, .webp) to the seed-images folder');
    process.exit(1);
  }



  // Parse image mappings
  const imageMappings: ImageMapping[] = files.map(file => {
    const mapping: ImageMapping = { fileName: file };
    
    // Check if it's a product image
    const productMatch = file.match(/^product-(.+)\.(jpg|jpeg|png|webp)$/i);
    if (productMatch) {
      mapping.productSlug = productMatch[1];
      mapping.altText = `Product image: ${productMatch[1].replace(/-/g, ' ')}`;
    }
    
    // Check if it's a category image
    const categoryMatch = file.match(/^category-(.+)\.(jpg|jpeg|png|webp)$/i);
    if (categoryMatch) {
      mapping.categorySlug = categoryMatch[1];
      mapping.altText = `Category: ${categoryMatch[1].replace(/-/g, ' ')}`;
    }
    
    return mapping;
  });

  // Get all products and categories from database
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    select: { id: true, slug: true, name: true }
  });

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, name: true }
  });





  // Process product images
  console.log('='.repeat(80));

  console.log('='.repeat(80));
  
  const productMappings = imageMappings.filter(m => m.productSlug);
  let uploadedProducts = 0;
  let skippedProducts = 0;

  for (const mapping of productMappings) {
    const product = products.find(p => p.slug === mapping.productSlug);
    
    if (!product) {

      skippedProducts++;
      continue;
    }

    try {
      console.log(`\n📤 Uploading for: ${product.name} (${mapping.fileName})`);
      
      // Read file
      const filePath = join(SEED_IMAGES_DIR, mapping.fileName);
      const fileBuffer = readFileSync(filePath);
      const fileExt = mapping.fileName.split('.').pop() || 'jpg';
      
      // Generate unique filename
      const uniqueId = uuidv4();
      const storagePath = `${product.id}/${uniqueId}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
          upsert: false
        });

      if (uploadError) {

        skippedProducts++;
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      // Generate all image sizes using Supabase transformations
      const imageUrls = {
        original: publicUrl,
        thumbnail: `${publicUrl}?width=150&height=150&fit=cover`,
        small: `${publicUrl}?width=300&height=300&fit=cover`,
        medium: `${publicUrl}?width=600&height=600&fit=cover`,
        large: `${publicUrl}?width=1200&height=1200&fit=cover`,
      };

      // Check if product already has images
      const existingImages = await prisma.productImage.count({
        where: { productId: product.id }
      });

      // Create image record in database
      await prisma.productImage.create({
        data: {
          productId: product.id,
          originalPath: storagePath,
          thumbnailUrl: imageUrls.thumbnail,
          smallUrl: imageUrls.small,
          mediumUrl: imageUrls.medium,
          largeUrl: imageUrls.large,
          altText: mapping.altText || product.name,
          isPrimary: existingImages === 0, // First image is primary
          sortOrder: existingImages,
        }
      });


      uploadedProducts++;

    } catch (error) {

      skippedProducts++;
    }
  }

  // Process category images
  console.log('\n' + '='.repeat(80));

  console.log('='.repeat(80));
  
  const categoryMappings = imageMappings.filter(m => m.categorySlug);
  let uploadedCategories = 0;
  let skippedCategories = 0;

  for (const mapping of categoryMappings) {
    const category = categories.find(c => c.slug === mapping.categorySlug);
    
    if (!category) {

      skippedCategories++;
      continue;
    }

    try {
      console.log(`\n📤 Uploading for category: ${category.name} (${mapping.fileName})`);
      
      // Read file
      const filePath = join(SEED_IMAGES_DIR, mapping.fileName);
      const fileBuffer = readFileSync(filePath);
      const fileExt = mapping.fileName.split('.').pop() || 'jpg';
      
      // Generate unique filename for category
      const uniqueId = uuidv4();
      const storagePath = `categories/${category.slug}-${uniqueId}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
          upsert: true
        });

      if (uploadError) {

        skippedCategories++;
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      // Update category with image URL
      await prisma.category.update({
        where: { id: category.id },
        data: { imageUrl: publicUrl }
      });


      uploadedCategories++;

    } catch (error) {

      skippedCategories++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));

  console.log('='.repeat(80));







}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
