import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Use non-prefixed env variables for server-side client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and Key must be provided in environment variables PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_KEY"
  );
}

export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
