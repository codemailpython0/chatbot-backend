const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and ANON_KEY must be defined in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  db: {
    schema: 'public'
  }
});

// Test connection on startup
(async () => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    console.log('Supabase connected successfully');
  } catch (error) {
    console.error('Supabase connection error:', error);
    process.exit(1);
  }
})();

module.exports = { supabase };