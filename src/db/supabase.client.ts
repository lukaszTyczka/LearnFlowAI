import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Use prefixed env variables for browser client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and Key must be provided in environment variables PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_KEY"
  );
}

export const supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
