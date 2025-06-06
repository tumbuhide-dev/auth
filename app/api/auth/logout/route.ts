import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateApiKey } from "@/lib/middleware/validate-api-key"
import { createErrorResponse } from "@/lib/utils/error-handler"
import { logActivity } from "@/lib/utils/logger"

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    const apiKeyError = await validateApiKey(req)
    if (apiKeyError) return apiKeyError

    // Get authorization header
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          status: "error",
          message: "Unauthorized: Token tidak ditemukan",
        },
        { status: 200 },
      )
    }

    const token = authHeader.split(" ")[1]

    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Get user from token first (for logging)
    const {
      data: { user },
    } = await supabase.auth.getUser(token)

    // Sign out user (invalidate token)
    const { error } = await supabase.auth.admin.signOut(token)

    if (error) {
      return createErrorResponse(error)
    }

    // Log activity
    if (user) {
      await logActivity(user.id, "logout", {}, req)
    }

    return NextResponse.json({
      status: "success",
      message: "Logout berhasil",
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
