import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxiiqqveyfvtxxhottkl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4aWlxcXZleWZ2dHh4aG90dGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3NjYwNjMsImV4cCI6MjA1NTM0MjA2M30.FvF-LfjYYuy6QiyE501ytVAxSU6Bnm8OZJcuJFGfHno';

console.log('Supabase config:', { 
  hasUrl: !!supabaseUrl, 
  hasKey: !!supabaseAnonKey,
  urlFromEnv: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  keyFromEnv: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey });
  throw new Error('Missing Supabase environment variables');
}

// Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export { supabase };
export default supabase;