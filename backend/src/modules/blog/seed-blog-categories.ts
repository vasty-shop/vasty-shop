/**
 * Seed Blog Categories
 * Run: npx ts-node -r tsconfig-paths/register src/modules/blog/seed-blog-categories.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

// TODO: Replace with pg Pool import
import { Pool } from 'pg';

const blogCategories = [
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Latest tech news, gadgets, and innovations',
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Tips and stories about everyday living',
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Fashion trends, style guides, and outfit ideas',
  },
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Health tips, fitness, and wellness advice',
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Business news, entrepreneurship, and career tips',
  },
  {
    name: 'Travel',
    slug: 'travel',
    description: 'Travel guides, destinations, and adventure stories',
  },
  {
    name: 'Food & Recipes',
    slug: 'food-recipes',
    description: 'Delicious recipes and food-related content',
  },
  {
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Movies, music, games, and pop culture',
  },
  {
    name: 'News & Updates',
    slug: 'news-updates',
    description: 'Latest news and platform updates',
  },
  {
    name: 'Tutorials',
    slug: 'tutorials',
    description: 'How-to guides and educational content',
  },
];

async function seedBlogCategories() {
  console.log('🌱 Seeding blog categories...\n');

  const apiKey = process.env.DATABASE_SERVICE_KEY;
  if (!apiKey) {
    console.error('❌ DATABASE_SERVICE_KEY not found in environment');
    process.exit(1);
  }

  const database = new databaseClient(apiKey);

  for (const category of blogCategories) {
    try {
      // Check if category already exists
      const existing = await database.query
        .from('blog_categories')
        .select('id')
        .where('slug', category.slug)
        .get();

      if (existing && existing.length > 0) {
        console.log(`⏭️  Category "${category.name}" already exists, skipping...`);
        continue;
      }

      // Insert category
      await database.query
        .from('blog_categories')
        .insert({
          name: category.name,
          slug: category.slug,
          description: category.description,
          is_active: true,
          sort_order: blogCategories.indexOf(category),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .execute();

      console.log(`✅ Created category: ${category.name}`);
    } catch (error: any) {
      console.error(`❌ Failed to create category "${category.name}":`, error.message);
    }
  }

  console.log('\n🎉 Blog categories seeding complete!');
}

seedBlogCategories()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
