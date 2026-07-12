import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xfjbldhifbchdqvumovl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmamJsZGhpZmJjaGRxdnVtb3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MjM1ODIsImV4cCI6MjA5OTM5OTU4Mn0.-f1gYaMcbdTgkGYaH7OHBBKdjaaFA2YZqhSBilFRW-A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Inserting message with extra columns...');
  const { data, error } = await supabase.from('chat_messages').insert([{
    sender: 'client',
    clientemail: 'test@mail.com',
    clientname: 'Test Client',
    text: 'Test message',
    time: 'Just now',
    attachment: { name: 'file.jpg', type: 'image/jpeg', url: 'http://test.com/file.jpg' },
    reactions: { '👍': ['test@mail.com'] }
  }]).select();

  if (error) {
    console.log('Error inserting:', error.message, error.details);
  } else {
    console.log('Inserted successfully!', data);
    console.log('Cleaning up...');
    await supabase.from('chat_messages').delete().eq('clientemail', 'test@mail.com');
  }
}

run();
