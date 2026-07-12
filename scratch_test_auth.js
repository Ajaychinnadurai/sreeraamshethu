import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xfjbldhifbchdqvumovl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmamJsZGhpZmJjaGRxdnVtb3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MjM1ODIsImV4cCI6MjA5OTM5OTU4Mn0.-f1gYaMcbdTgkGYaH7OHBBKdjaaFA2YZqhSBilFRW-A'
);

async function run() {
  const { data, error } = await supabase.from('registered_users').select('*');
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('All users in database:');
    data.forEach(u => console.log(`  email=${u.email} | password_hash_prefix=${u.password?.substring(0,20)}...`));
  }
}

run();
