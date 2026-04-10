/**
 * Script to set a user's role to admin
 * Run: npx ts-node scripts/set-admin-role.ts <email>
 */

import { vastyClient } from '@vasty/node-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

async function setAdminRole(email: string) {
  const apiKey = process.env.vasty_API_KEY;

  if (!apiKey) {
    console.error('❌ vasty_API_KEY not found in .env');
    process.exit(1);
  }

  if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: npx ts-node scripts/set-admin-role.ts <email>');
    process.exit(1);
  }

  console.log(`🔄 Setting admin role for: ${email}`);

  try {
    const client = new vastyClient(apiKey);

    // Search for user by email
    const searchResult = await client.auth.searchUsers(email, { limit: 1 });

    if (!searchResult || !searchResult.users || searchResult.users.length === 0) {
      console.error(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    const user = searchResult.users[0];
    console.log(`✅ Found user: ${user.id} (${user.email})`);

    // Update user metadata with admin role
    const updatedUser = await client.auth.updateUser(user.id, {
      metadata: {
        ...user.metadata,
        role: 'admin'
      }
    });

    console.log(`✅ Successfully set admin role for ${email}`);
    console.log('Updated user:', JSON.stringify(updatedUser, null, 2));

  } catch (error: any) {
    console.error('❌ Error:', error?.message || error);
    process.exit(1);
  }
}

// Get email from command line args
const email = process.argv[2];
setAdminRole(email);
