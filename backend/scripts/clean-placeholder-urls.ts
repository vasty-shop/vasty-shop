/**
 * Script to find and clean placeholder URLs from database
 * Run with: npx ts-node scripts/clean-placeholder-urls.ts
 */

import { vastyClient } from '@vasty/node-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

async function cleanPlaceholderUrls() {
  const apiKey = process.env.vasty_API_KEY;

  if (!apiKey) {
    console.error('vasty_API_KEY not found in environment');
    process.exit(1);
  }

  const client = new vastyClient(apiKey);

  try {
    // Check products table for placeholder images
    console.log('Checking products for placeholder images...');
    const products = await client.query
      .from('products')
      .select('id', 'name', 'images')
      .get();

    let cleanedCount = 0;

    for (const product of products || []) {
      if (!product.images) continue;

      let images = product.images;
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch {
          continue;
        }
      }

      if (!Array.isArray(images)) continue;

      // Filter out placeholder URLs
      const cleanedImages = images.filter((img: any) => {
        const url = typeof img === 'string' ? img : img?.url;
        if (!url) return false;
        if (url.includes('placeholder.com')) return false;
        if (url.includes('placehold.co')) return false;
        if (url.includes('picsum.photos')) return false;
        return true;
      });

      if (cleanedImages.length !== images.length) {
        console.log(`Cleaning images for product: ${product.name} (${product.id})`);
        console.log(`  Before: ${images.length} images, After: ${cleanedImages.length} images`);

        await client.query
          .from('products')
          .where('id', product.id)
          .update({ images: cleanedImages })
          .execute();

        cleanedCount++;
      }
    }

    console.log(`\nDone! Cleaned ${cleanedCount} products with placeholder images.`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanPlaceholderUrls();
