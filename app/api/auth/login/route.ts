import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { loginSchema } from "@/lib/schemas/auth"
import { validateApiKey } from "@/lib/middleware/validate-api-key"
import { rateLimit } from "@/lib/middleware/rate-limit"
import { createErrorResponse } from "@/lib/utils/error-handler"
import { logActivity } from "@/lib/utils/logger"

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    const apiKeyError = await validateApiKey(req)
    if (apiKeyError) return apiKeyError

    // Apply rate limiting (10 requests per minute)
    const rateLimitError = await rateLimit(req, 10, 60)
    if (rateLimitError) return rateLimitError

    // Parse request body
    const body = await req.json()

    // Validate input
    const validationResult = loginSchema.safeParse(body)
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

    const { email, password } = validationResult.data

    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Sign in user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return createErrorResponse(error)
    }

    // Check if email is verified
    if (!data.user.email_confirmed_at) {
      return NextResponse.json(
        {
          status: "error",
          message: "Email belum diverifikasi. Silakan verifikasi email Anda terlebih dahulu.",
        },
        { status: 200 },
      )
    }

    // Get user role from public.users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role_id, status")
      .eq("id", data.user.id)
      .single()

    if (userError) {
      return createErrorResponse(userError)
    }

    // Check if user is active
    if (userData.status !== "active") {
      // Update status to active if it's pending
      if (userData.status === "pending") {
        await supabase
          .from("users")
          .update({ status: "active", updated_at: new Date().toISOString() })
          .eq("id", data.user.id)
      } else {
        return NextResponse.json(
          {
            status: "error",
            message: "Akun Anda tidak aktif. Silakan hubungi administrator.",
          },
          { status: 200 },
        )
      }
    }

    // Get role name
    const { data: roleData } = await supabase.from("roles").select("name").eq("id", userData.role_id).single()

    // Log activity
    await logActivity(data.user.id, "login", { email }, req)

    // Determine what data to show based on environment
    const showSensitiveData = process.env.NEXT_PUBLIC_SHOW_SENSITIVE_DATA === "true"

    return NextResponse.json({
      status: "success",
      message: "Login berhasil",
      data: {
        user: {
          id: data.user.id,
          email: showSensitiveData ? data.user.email : undefined,
          role: roleData?.name || "user",
        },
        session: showSensitiveData
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at,
            }
          : {
              token: data.session.access_token, // Only show token for client storage
              expires_at: data.session.expires_at,
            },
      },
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
