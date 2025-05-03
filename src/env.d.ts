/// <reference types="astro/client" />
/// <reference types="vite/client" />

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";
import type { Runtime } from "@astrojs/cloudflare";

// Define the shape of environment variables available in Cloudflare
interface Env {
  OPENROUTER_API_KEY: string;
  // Add other Cloudflare environment variables/secrets/bindings here
  // e.g., MY_KV_NAMESPACE: KVNamespace;
}

declare global {
  namespace App {
    interface Locals extends Runtime<Env> {
      supabase: SupabaseClient<Database>;
      user: User | null;
    }
  }
}
