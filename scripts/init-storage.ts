import { initializeStorage } from '../src/config/supabase';

async function main() {
  console.log('🔧 Initializing Supabase Storage...\n');
  
  const success = await initializeStorage();
  
  if (success) {
    console.log('\n✅ Storage initialization complete!');
    console.log('You can now run: npx tsx scripts/auto-seed-free-images.ts');
  } else {
    console.error('\n❌ Failed to initialize storage');
    process.exit(1);
  }
}

main();
