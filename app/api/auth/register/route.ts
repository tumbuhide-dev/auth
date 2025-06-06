import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { registerSchema } from "@/lib/schemas/auth"
import { validateApiKey } from "@/lib/middleware/validate-api-key"
import { rateLimit } from "@/lib/middleware/rate-limit"
import { createErrorResponse } from "@/lib/utils/error-handler"
import { logActivity } from "@/lib/utils/logger"

export async function POST(req: NextRequest) {
  try {
    console.log("🔄 Register endpoint called")

    // Validate API key
    console.log("🔑 Validating API key...")
    const apiKeyError = await validateApiKey(req)
    if (apiKeyError) {
      console.log("❌ API key validation failed")
      return apiKeyError
    }
    console.log("✅ API key validated")

    // Apply rate limiting (5 requests per minute)
    console.log("⏱️ Checking rate limit...")
    const rateLimitError = await rateLimit(req, 5, 60)
    if (rateLimitError) {
      console.log("❌ Rate limit exceeded")
      return rateLimitError
    }
    console.log("✅ Rate limit OK")

    // Parse request body
    console.log("📦 Parsing request body...")
    const body = await req.json()
    console.log("📝 Request body:", { email: body.email, passwordLength: body.password?.length })

    // Validate input
    console.log("✅ Validating input schema...")
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      console.log("❌ Validation failed:", validationResult.error.errors)
      return NextResponse.json(
        {
          status: "error",
          message: "Validasi gagal",
          errors: validationResult.error.errors,
        },
        { status: 200 },
      )
    }
    console.log("✅ Input validation passed")

    const { email, password } = validationResult.data

    // Create Supabase client
    console.log("🔗 Creating Supabase client...")
    try {
      const supabase = createServerSupabaseClient()
      console.log("✅ Supabase client created")

      // Test connection first
      console.log("🧪 Testing Supabase connection...")
      const { data: testData, error: testError } = await supabase.from("roles").select("count").limit(1)

      if (testError) {
        console.error("❌ Supabase connection test failed:", testError)
        return NextResponse.json(
          {
            status: "error",
            message: "Database connection failed",
            details: testError,
          },
          { status: 200 },
        )
      }
      console.log("✅ Supabase connection test passed")

      // Register user
      console.log("👤 Attempting to register user...")
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      })

      if (error) {
        console.error("❌ Registration failed:", error)
        return createErrorResponse(error)
      }

      console.log("✅ User registered successfully:", data.user?.id)

      // Log activity
      try {
        await logActivity(data.user?.id || null, "register", { email }, req)
        console.log("✅ Activity logged")
      } catch (logError) {
        console.error("⚠️ Failed to log activity:", logError)
        // Don't fail the request if logging fails
      }

      return NextResponse.json({
        status: "success",
        message: "Pendaftaran berhasil. Silakan verifikasi email Anda.",
        data: {
          user: {
            id: data.user?.id,
            email: data.user?.email,
          },
        },
      })
    } catch (supabaseError) {
      console.error("💥 Supabase client error:", supabaseError)
      return NextResponse.json(
        {
          status: "error",
          message: "Database configuration error",
          details: process.env.NODE_ENV === "development" ? supabaseError : undefined,
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("💥 Register endpoint error:", error)
    return createErrorResponse(error)
  }
}
