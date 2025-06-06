import { createServerSupabaseClient } from "../supabase/server"

export const logActivity = async (userId: string | null, action: string, details: any = {}, req: Request) => {
  try {
    const supabase = createServerSupabaseClient()
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"

    await supabase.from("audit_logs").insert([
      {
        user_id: userId,
        action,
        details,
        ip_address: ip,
        user_agent: userAgent,
      },
    ])
  } catch (error) {
    console.error("Error logging activity:", error)
    // Don't throw, just log the error
  }
}
