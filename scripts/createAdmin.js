/**
 * Admin account creation utility.
 *
 * Usage:
 *   node scripts/createAdmin.js --email admin@example.com --password SecurePass1 --name "Admin Name"
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment.
 * NEVER run this with the anon key.
 *
 * IMPORTANT: Always use this script (Admin API) to create users.
 * Never INSERT directly into auth.users via raw SQL — GoTrue requires
 * specific non-null string columns (email_change, phone, etc.) that
 * raw SQL will leave NULL, causing 500 errors on login.
 */
import { createClient } from '@supabase/supabase-js';

const args   = process.argv.slice(2);
const get    = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const email    = get('--email');
const password = get('--password');
const name     = get('--name') || 'Admin';

if (!email || !password) {
  console.error('Usage: node scripts/createAdmin.js --email <email> --password <pass> [--name <name>]');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  console.log(`Creating admin: ${email}`);

  // 1. Create user via Admin API (email auto-confirmed)
  const { data: { user }, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (createErr) {
    // If already exists, fetch the user
    if (createErr.message?.includes('already been registered')) {
      console.log('User already exists — ensuring admin role on profile...');
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existing = users.find((u) => u.email === email);
      if (!existing) { console.error('Could not find existing user.'); process.exit(1); }
      await upsertProfile(existing.id);
      return;
    }
    console.error('Error creating user:', createErr.message);
    process.exit(1);
  }

  console.log(`✅ Auth user created: ${user.id}`);
  await upsertProfile(user.id);
}

async function upsertProfile(userId) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, email, full_name: name, role: 'admin' }, { onConflict: 'id' });

  if (error) {
    console.error('Error setting admin role:', error.message);
    process.exit(1);
  }

  console.log(`✅ Profile upserted with role=admin`);
  console.log(`\n🎉 Admin account ready:`);
  console.log(`   Email:  ${email}`);
  console.log(`   Role:   admin`);
  console.log(`   Login:  /auth/login`);
}

run();
