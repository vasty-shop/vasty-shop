/**
 * Create Admin User Script
 *
 * Usage: npx ts-node src/scripts/create-admin.ts <email> <password> <name>
 *
 * Example: npx ts-node src/scripts/create-admin.ts admin@database.shop AdminPass123! "Admin User"
 */

// TODO: Replace with pg Pool import
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createAdminUser() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('❌ Usage: npx ts-node src/scripts/create-admin.ts <email> <password> <name>');
    console.error('   Example: npx ts-node src/scripts/create-admin.ts admin@database.shop AdminPass123! "Admin User"');
    process.exit(1);
  }

  const [email, password, name] = args;

  const apiKey = process.env.DATABASE_SERVICE_KEY;
  if (!apiKey) {
    console.error('❌ DATABASE_SERVICE_KEY environment variable is required');
    process.exit(1);
  }

  console.log('🔧 Creating admin user...');
  console.log(`   Email: ${email}`);
  console.log(`   Name: ${name}`);

  try {
    const client = new databaseClient(apiKey);

    // Register the user with admin role in metadata
    const authResult = await client.auth.register({
      email,
      password,
      name,
      role: 'admin', // This goes into metadata
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📋 Admin Details:');
    console.log(`   ID: ${authResult.user.id}`);
    console.log(`   Email: ${authResult.user.email}`);
    console.log(`   Name: ${authResult.user.name}`);
    console.log(`   Role: admin`);
    console.log('');
    console.log('🔐 You can now login at /admin/login with these credentials.');

  } catch (error: any) {
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log('⚠️  User with this email already exists. Trying to update role...');

      try {
        const client = new databaseClient(apiKey);

        // Sign in first to get user info
        const authResult = await client.auth.login({ email, password });
        const userId = authResult.user.id;

        // Update user metadata to set admin role
        // Note: This depends on database having an update user method
        console.log('✅ User exists. Please update the role manually in the database:');
        console.log('');
        console.log(`   UPDATE auth.users SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"admin"') WHERE id = '${userId}';`);
        console.log('');
        console.log('   Or via database dashboard, update user metadata: { "role": "admin" }');

      } catch (loginError: any) {
        console.error('❌ Failed to verify existing user:', loginError.message);
      }
    } else {
      console.error('❌ Failed to create admin user:', error.message);
    }
    process.exit(1);
  }
}

createAdminUser();
