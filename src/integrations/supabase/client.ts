// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://afqwtkxesmdtljnfrdsa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcXd0a3hlc21kdGxqbmZyZHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTg2NzIsImV4cCI6MjA2NzI5NDY3Mn0.R5KycQnZ05xd7Dku-_92BmVXYUecE3jSGdepLVsoE64";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});