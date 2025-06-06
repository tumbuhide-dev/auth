import { createClient } from "@supabase/supabase-js"

// Untuk digunakan di client-side
let supabaseClient: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or Anon Key not found")
  }

  // Validate URL format (relaxed - allow custom domains)
  if (!supabaseUrl.startsWith("https://")) {
    throw new Error("Invalid Supabase URL format - must use HTTPS")
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}
