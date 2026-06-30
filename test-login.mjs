import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log("Testing login for admin...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@pps-belawan.go.id',
    password: 'admin123',
  });
  
  if (error) {
    console.error("LOGIN ERROR:", error);
  } else {
    console.log("LOGIN SUCCESS! User ID:", data.user.id);
  }
}

testLogin();
