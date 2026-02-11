import { initializeStorage } from '../src/config/supabase';

async function main() {

  
  const success = await initializeStorage();
  
  if (success) {


  } else {

    process.exit(1);
  }
}

main();
