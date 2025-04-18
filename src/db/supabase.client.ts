import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || "";

export type { SupabaseClient };
export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
