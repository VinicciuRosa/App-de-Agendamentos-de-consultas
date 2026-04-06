import { createClient } from "@supabase/supabase-js";

// JS client for Supabase from original implementation
const supabaseUrl = "https://lgmnbcafffazzwhfnsbs.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnbW5iY2FmZmZhenp3aGZuc2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MzkyMjEsImV4cCI6MjA5MTAxNTIyMX0.nLTeEwpI57GWr4eyX6GZkG9GUxFT21VZcg9bAqSfDtY";

export const supabase = createClient(supabaseUrl, supabaseKey);
