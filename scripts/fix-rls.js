import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

let SUPABASE_URL = '';
let SUPABASE_SECRET_KEY = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) SUPABASE_SECRET_KEY = line.split('=')[1].trim();
  });
}

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('❌ Missing credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

async function fixRLS() {
  console.log('⏳ Updating RLS policy for public.users...');
  
  // Note: We can't run arbitrary SQL via the JS client unless there is an RPC.
  // However, we can try to use the CLI if it's a local supabase instance, 
  // or we can just tell the user to run it in the SQL Editor.
  
  console.log('⚠️ Notice: To support username login, you MUST run this in your Supabase SQL Editor:');
  console.log(`
    DROP POLICY IF EXISTS "Users: read any" ON public.users;
    CREATE POLICY "Users: read any" ON public.users FOR SELECT USING (true);
  `);
}

fixRLS();
