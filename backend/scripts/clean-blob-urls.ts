/**
 * Script to clean invalid blob URLs from shops table
 * Run with: npx ts-node scripts/clean-blob-urls.ts
 */

import { vastyClient } from '@vasty/node-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

async function cleanBlobUrls() {
  const apiKey = process.env.vasty_API_KEY;

  if (!apiKey) {
    console.error('vasty_API_KEY not found in environment');
    process.exit(1);
  }

  const client = new vastyClient(apiKey);

  try {
    // Find shops with blob URLs
    const shopsWithBlobLogo = await client.query
      .from('shops')
      .select('id', 'name', 'logo', 'banner')
      .where('logo', 'LIKE', 'blob:%')
      .get();

    const shopsWithBlobBanner = await client.query
      .from('shops')
      .select('id', 'name', 'logo', 'banner')
      .where('banner', 'LIKE', 'blob:%')
      .get();

    console.log('Shops with blob logo:', shopsWithBlobLogo?.length || 0);
    console.log('Shops with blob banner:', shopsWithBlobBanner?.length || 0);

    // Clean logo blob URLs
    if (shopsWithBlobLogo?.length > 0) {
      for (const shop of shopsWithBlobLogo) {
        console.log(`Cleaning logo for shop: ${shop.name} (${shop.id})`);
        await client.query
          .from('shops')
          .where('id', shop.id)
          .update({ logo: null })
          .execute();
      }
    }

    // Clean banner blob URLs
    if (shopsWithBlobBanner?.length > 0) {
      for (const shop of shopsWithBlobBanner) {
        console.log(`Cleaning banner for shop: ${shop.name} (${shop.id})`);
        await client.query
          .from('shops')
          .where('id', shop.id)
          .update({ banner: null })
          .execute();
      }
    }

    console.log('Done! Blob URLs cleaned.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanBlobUrls();
