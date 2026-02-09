import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Bucket name for product images
export const STORAGE_BUCKET = 'product-images';

// Initialize storage bucket (run this once during setup)
export async function initializeStorage() {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === STORAGE_BUCKET);

    if (!bucketExists) {
      // Create bucket
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      });

      if (error) {
        console.error('Error creating bucket:', error);
        return false;
      }

      console.log('✅ Storage bucket created:', STORAGE_BUCKET);
    }

    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
}

// Generate image URLs for different sizes
export function generateImageUrls(path: string) {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  const baseUrl = data.publicUrl;

  return {
    original: baseUrl,
    thumbnail: `${baseUrl}?width=150&height=150&fit=cover`,
    small: `${baseUrl}?width=300&height=300&fit=cover`,
    medium: `${baseUrl}?width=600&height=600&fit=cover`,
    large: `${baseUrl}?width=1200&height=1200&fit=cover`,
  };
}
