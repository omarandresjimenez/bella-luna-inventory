import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Analyzing database for products and categories without images...\n');

  // Get all products with their image count
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      description: true,
      categories: {
        select: {
          category: {
            select: { name: true, slug: true }
          }
        }
      },
      _count: {
        select: { images: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Get all categories with their image status
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      imageUrl: true,
      parentId: true,
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Separate products with and without images
  const productsWithoutImages = products.filter(p => p._count.images === 0);
  const productsWithImages = products.filter(p => p._count.images > 0);

  // Separate categories with and without images
  const categoriesWithoutImages = categories.filter(c => !c.imageUrl);
  const categoriesWithImages = categories.filter(c => c.imageUrl);

  console.log('='.repeat(80));
  console.log('📦 PRODUCTS NEEDING IMAGES');
  console.log('='.repeat(80));
  console.log(`Total Products: ${products.length}`);
  console.log(`Products WITHOUT images: ${productsWithoutImages.length}`);
  console.log(`Products WITH images: ${productsWithImages.length}`);
  console.log();

  if (productsWithoutImages.length > 0) {
    console.log('📝 LIST OF PRODUCTS WITHOUT IMAGES:\n');
    productsWithoutImages.forEach((product, index) => {
      const categoryNames = product.categories.map(c => c.category.name).join(', ') || 'No category';
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   SKU/Slug: ${product.slug}`);
      console.log(`   Brand: ${product.brand || 'N/A'}`);
      console.log(`   Categories: ${categoryNames}`);
      console.log(`   Search terms: "${product.brand || ''} ${product.name}"`);
      console.log();
    });
  }

  console.log('='.repeat(80));
  console.log('📁 CATEGORIES NEEDING IMAGES');
  console.log('='.repeat(80));
  console.log(`Total Categories: ${categories.length}`);
  console.log(`Categories WITHOUT images: ${categoriesWithoutImages.length}`);
  console.log(`Categories WITH images: ${categoriesWithImages.length}`);
  console.log();

  if (categoriesWithoutImages.length > 0) {
    console.log('📝 LIST OF CATEGORIES WITHOUT IMAGES:\n');
    categoriesWithoutImages.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
      console.log(`   Slug: ${category.slug}`);
      console.log(`   Description: ${category.description || 'N/A'}`);
      console.log(`   Products count: ${category._count.products}`);
      console.log(`   Search terms: "${category.name} products" or "${category.name} collection"`);
      console.log();
    });
  }

  // Generate image search guide
  const imageGuide = generateImageGuide(productsWithoutImages, categoriesWithoutImages);
  const guidePath = join(process.cwd(), 'image-search-guide.md');
  writeFileSync(guidePath, imageGuide);

  console.log('='.repeat(80));
  console.log('📄 OUTPUT FILES CREATED:');
  console.log('='.repeat(80));
  console.log(`1. ${guidePath} - Guide for finding free images`);
  console.log();
  console.log('✅ Next steps:');
  console.log('   1. Read image-search-guide.md for search suggestions');
  console.log('   2. Download free images from Unsplash.com or Pexels.com');
  console.log('   3. Save images to ./seed-images/ folder');
  console.log('   4. Run: npx tsx scripts/seed-images.ts');
  console.log();
}

function generateImageGuide(
  products: any[],
  categories: any[]
): string {
  let guide = `# Image Search Guide for Bella Luna Products\n\n`;
  guide += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  
  guide += `## 🔍 Best Free Image Sources\n\n`;
  guide += `1. **Unsplash** (https://unsplash.com) - High quality, free for commercial use\n`;
  guide += `2. **Pexels** (https://pexels.com) - Free stock photos and videos\n`;
  guide += `3. **Pixabay** (https://pixabay.com) - Large collection of free images\n\n`;
  
  guide += `## ⚠️ Important Notes\n\n`;
  guide += `- Always check the license - look for "Free for commercial use"\n`;
  guide += `- Prefer images with natural lighting and clean backgrounds\n`;
  guide += `- Download high resolution versions (at least 1200px wide)\n`;
  guide += `- Save images with descriptive names (e.g., "gold-necklace-product.jpg")\n\n`;

  if (categories.length > 0) {
    guide += `## 📁 Categories - Image Suggestions\n\n`;
    categories.forEach((cat, i) => {
      guide += `### ${i + 1}. ${cat.name}\n`;
      guide += `- **Search terms**: "${cat.name}", "${cat.name} collection", "${cat.name} elegant"\n`;
      guide += `- **Style suggestion**: Category banner/cover image\n`;
      guide += `- **Size**: 800x600px or 1200x400px for banners\n\n`;
    });
  }

  if (products.length > 0) {
    guide += `## 📦 Products - Image Suggestions\n\n`;
    products.forEach((product, i) => {
      const brand = product.brand || '';
      const category = product.categories[0]?.category?.name || 'product';
      
      guide += `### ${i + 1}. ${product.name}\n`;
      guide += `- **Brand**: ${brand || 'N/A'}\n`;
      guide += `- **Category**: ${category}\n`;
      guide += `- **Unsplash search**: "${brand} ${product.name}", "${category} ${product.name}", "elegant ${category}"\n`;
      guide += `- **Pexels search**: "${product.name}", "${category} jewelry", "${category} accessory"\n`;
      guide += `- **File name suggestion**: ${product.slug}-product.jpg\n\n`;
    });
  }

  guide += `## 💾 How to Save Images\n\n`;
  guide += `1. Create a folder: \`mkdir seed-images\`\n`;
  guide += `2. Download images and save them with these naming patterns:\n`;
  guide += `   - Products: \`product-{product-slug}.jpg\`\n`;
  guide += `   - Categories: \`category-{category-slug}.jpg\`\n`;
  guide += `3. Run the seeding script to upload to your database\n\n`;

  return guide;
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
