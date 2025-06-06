import { createClient } from "@supabase/supabase-js"

// Untuk digunakan di server-side (API routes)
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL or Service Role Key not found")
  }

  // Validate URL format (relaxed - allow custom domains)
  if (!supabaseUrl.startsWith("https://")) {
    throw new Error("Invalid Supabase URL format - must use HTTPS")
  }

  try {
    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    return client
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    throw new Error(`Failed to create Supabase client: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
