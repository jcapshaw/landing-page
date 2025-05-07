import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://uxiiqqveyfvtxxhottkl.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize Supabase Admin client with service role key for admin operations
export function getSupabaseAdmin() {
  if (!supabaseServiceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
    throw new Error('Supabase Admin initialization failed: Service role key not found');
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log('Supabase Admin client initialized successfully');
    return supabaseAdmin;
  } catch (error) {
    console.error('Error initializing Supabase Admin client:', error);
    throw new Error('Supabase Admin initialization failed');
  }
}

// Helper function to get Supabase Auth admin operations
export function getAuth() {
  return getSupabaseAdmin().auth;
}