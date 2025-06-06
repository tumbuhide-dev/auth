import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { forgotPasswordSchema } from "@/lib/schemas/auth"
import { validateApiKey } from "@/lib/middleware/validate-api-key"
import { rateLimit } from "@/lib/middleware/rate-limit"
import { createErrorResponse } from "@/lib/utils/error-handler"
import { logActivity } from "@/lib/utils/logger"

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    const apiKeyError = await validateApiKey(req)
    if (apiKeyError) return apiKeyError

    // Apply rate limiting (3 requests per hour)
    const rateLimitError = await rateLimit(req, 3, 3600)
    if (rateLimitError) return rateLimitError

    // Parse request body
    const body = await req.json()

    // Validate input
    const validationResult = forgotPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Validasi gagal",
          errors: validationResult.error.errors,
        },
        { status: 200 },
      )
    }

    const { email } = validationResult.data

    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Check if user exists
    const { data: userData } = await supabase.auth.admin.listUsers()
    const userExists = userData.users.some((user) => user.email === email)

    // Send password reset email dengan redirect ke format default Supabase
    if (userExists) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/v1/verify`,
      })

      if (error) {
        return createErrorResponse(error)
      }

      // Log activity
      const user = userData.users.find((u) => u.email === email)
      await logActivity(user?.id || null, "forgot_password_request", { email }, req)
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      status: "success",
      message: "Jika email terdaftar, instruksi reset password akan dikirim ke email Anda.",
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
