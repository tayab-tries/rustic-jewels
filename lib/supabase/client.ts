import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if Supabase credentials are configured and not placeholders
export const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("placeholder-change-me") &&
  !supabaseAnonKey.includes("placeholder-change-me");

export const supabase = isSupabaseConfigured
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as ReturnType<typeof createBrowserClient>); // Fallback handled in productService/authService
