const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let url, key;
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1];
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1];
}
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);
async function check() {
  const { data } = await supabase.from('users_profiles').select('*').eq('role', 'SUPER_ADMIN');
  console.log("Super Admins:", data);
}
check();
