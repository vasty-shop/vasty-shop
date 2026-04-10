/**
 * Create Delivery Partner User Script
 *
 * Usage: npx ts-node src/scripts/create-delivery-partner.ts <email> <password> <name>
 *
 * Example: npx ts-node src/scripts/create-delivery-partner.ts delivery@database.shop DeliveryPass123! "Delivery Partner"
 */

// TODO: Replace with pg Pool import
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createDeliveryPartner() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('❌ Usage: npx ts-node src/scripts/create-delivery-partner.ts <email> <password> <name>');
    console.error('   Example: npx ts-node src/scripts/create-delivery-partner.ts delivery@database.shop DeliveryPass123! "Delivery Partner"');
    process.exit(1);
  }

  const [email, password, name] = args;

  const apiKey = process.env.DATABASE_SERVICE_KEY;
  if (!apiKey) {
    console.error('❌ DATABASE_SERVICE_KEY environment variable is required');
    process.exit(1);
  }

  console.log('🚚 Creating delivery partner account...');
  console.log(`   Email: ${email}`);
  console.log(`   Name: ${name}`);

  try {
    const client = new databaseClient(apiKey);

    // Register the user with delivery_man role in metadata
    const authResult = await client.auth.register({
      email,
      password,
      name,
      role: 'delivery_man',
    });

    console.log('✅ Delivery partner account created successfully!');
    console.log('');
    console.log('📋 Account Details:');
    console.log(`   ID: ${authResult.user.id}`);
    console.log(`   Email: ${authResult.user.email}`);
    console.log(`   Name: ${authResult.user.name}`);
    console.log(`   Role: delivery_man`);
    console.log('');
    console.log('🚚 You can now login at /delivery/login with these credentials.');

  } catch (error: any) {
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log('⚠️  User with this email already exists.');
      console.log('');
      console.log('To update an existing user to delivery partner role, run this SQL:');
      console.log('');
      console.log(`   UPDATE auth.users SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'), '{role}', '"delivery_man"') WHERE email = '${email}';`);
    } else {
      console.error('❌ Failed to create delivery partner:', error.message);
    }
    process.exit(1);
  }
}

createDeliveryPartner();
