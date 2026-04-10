/**
 * Category Seed Script
 * Seeds the database with predefined shop/store categories
 *
 * Run with: npx tsx src/modules/categories/seed-categories.ts
 */

// TODO: Replace with pg Pool import
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_SERVICE_KEY = process.env.DATABASE_SERVICE_KEY;

if (!DATABASE_SERVICE_KEY) {
  console.error('Error: DATABASE_SERVICE_KEY not found in environment variables');
  process.exit(1);
}

const client = new databaseClient(DATABASE_SERVICE_KEY);

/**
 * Predefined categories for shops and products
 */
const CATEGORIES = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Computers, phones, gadgets, and electronic devices',
    icon: 'Laptop',
    image: '/images/categories/electronics.jpg',
    display_order: 1,
    is_active: true,
    is_featured: true,
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing, shoes, accessories, and fashion items',
    icon: 'Shirt',
    image: '/images/categories/fashion.jpg',
    display_order: 2,
    is_active: true,
    is_featured: true,
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Furniture, decor, kitchen, and outdoor items',
    icon: 'Home',
    image: '/images/categories/home-garden.jpg',
    display_order: 3,
    is_active: true,
    is_featured: true,
  },
  {
    name: 'Beauty & Health',
    slug: 'beauty-health',
    description: 'Cosmetics, skincare, wellness, and health products',
    icon: 'Sparkles',
    image: '/images/categories/beauty-health.jpg',
    display_order: 4,
    is_active: true,
    is_featured: true,
  },
  {
    name: 'Food & Groceries',
    slug: 'food-groceries',
    description: 'Fresh food, packaged goods, beverages, and groceries',
    icon: 'UtensilsCrossed',
    image: '/images/categories/food-groceries.jpg',
    display_order: 5,
    is_active: true,
    is_featured: true,
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Sports equipment, outdoor gear, and fitness products',
    icon: 'Dumbbell',
    image: '/images/categories/sports-outdoors.jpg',
    display_order: 6,
    is_active: true,
    is_featured: false,
  },
  {
    name: 'Toys & Games',
    slug: 'toys-games',
    description: 'Toys, board games, video games, and entertainment',
    icon: 'Gamepad2',
    image: '/images/categories/toys-games.jpg',
    display_order: 7,
    is_active: true,
    is_featured: false,
  },
  {
    name: 'Books & Media',
    slug: 'books-media',
    description: 'Books, magazines, music, and digital media',
    icon: 'BookOpen',
    image: '/images/categories/books-media.jpg',
    display_order: 8,
    is_active: true,
    is_featured: false,
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    description: 'Car parts, accessories, and automotive products',
    icon: 'Car',
    image: '/images/categories/automotive.jpg',
    display_order: 9,
    is_active: true,
    is_featured: false,
  },
  {
    name: 'Baby & Kids',
    slug: 'baby-kids',
    description: 'Baby products, kids clothing, and children items',
    icon: 'Baby',
    image: '/images/categories/baby-kids.jpg',
    display_order: 10,
    is_active: true,
    is_featured: false,
  },
  {
    name: 'Pets',
    slug: 'pets',
    description: 'Pet food, supplies, and accessories',
    icon: 'PawPrint',
    image: '/images/categories/pets.jpg',
    display_order: 11,
    is_active: true,
    is_featured: false,
  },
  {
    name: 'Jewelry & Watches',
    slug: 'jewelry-watches',
    description: 'Fine jewelry, watches, and accessories',
    icon: 'Gem',
    image: '/images/categories/jewelry-watches.jpg',
    display_order: 12,
    is_active: true,
    is_featured: false,
  },
  {
    name: 'Office & Stationery',
    slug: 'office-stationery',
    description: 'Office supplies, stationery, and business equipment',
    icon: 'Briefcase',
    image: '/images/categories/office-stationery.jpg',
    display_order: 13,
    is_active: true,
    is_featured: false,
  },
  {
    name: 'Art & Crafts',
    slug: 'art-crafts',
    description: 'Art supplies, craft materials, and handmade items',
    icon: 'Palette',
    image: '/images/categories/art-crafts.jpg',
    display_order: 14,
    is_active: true,
    is_featured: false,
  },
  {
    name: 'Services',
    slug: 'services',
    description: 'Professional services, repairs, and consulting',
    icon: 'Wrench',
    image: '/images/categories/services.jpg',
    display_order: 15,
    is_active: true,
    is_featured: false,
  },
];

/**
 * Seed categories table
 */
async function seedCategories() {
  console.log('Seeding categories...');

  const categoryData = CATEGORIES.map((category) => ({
    ...category,
    level: 0,
    product_count: 0,
    meta_title: category.name,
    meta_description: category.description,
    meta_keywords: JSON.stringify([category.slug, category.name.toLowerCase()]),
  }));

  try {
    // Check if categories already exist
    const existing = await client.query
      .from('categories')
      .select('id')
      .limit(1)
      .get();

    if (existing && existing.length > 0) {
      console.log('Categories already exist. Skipping seed (use --force to override)');

      // Check for --force flag
      if (process.argv.includes('--force')) {
        console.log('Force flag detected. Deleting existing categories...');
        // Delete each category by ID
        for (const category of existing) {
          await client.query.from('categories').where('id', category.id).delete().execute();
        }
        console.log(`Deleted ${existing.length} existing categories`);
      } else {
        return;
      }
    }

    // Insert new categories
    const result = await client.query
      .from('categories')
      .insert(categoryData)
      .execute();

    console.log(`✓ Seeded ${categoryData.length} categories`);
  } catch (error) {
    console.error('Error seeding categories:', error.message);
    throw error;
  }
}

/**
 * Main seed function
 */
async function seed() {
  console.log('Starting category seed...\n');

  try {
    await seedCategories();

    console.log('\n✓ Category seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Category seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seed();
