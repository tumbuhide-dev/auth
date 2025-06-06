import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateApiKey } from "@/lib/middleware/validate-api-key"
import { createErrorResponse } from "@/lib/utils/error-handler"

export async function GET(req: NextRequest) {
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

    // Get user from token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json(
        {
          status: "error",
          message: "Unauthorized: Token tidak valid",
        },
        { status: 200 },
      )
    }

    // Get user role from public.users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role_id, status")
      .eq("id", user.id)
      .single()

    if (userError) {
      return createErrorResponse(userError)
    }

    // Get role name
    const { data: roleData } = await supabase.from("roles").select("name").eq("id", userData.role_id).single()

    // Determine what data to show based on environment
    const showSensitiveData = process.env.NEXT_PUBLIC_SHOW_SENSITIVE_DATA === "true"

    return NextResponse.json({
      status: "success",
      message: "Data pengguna berhasil diambil",
      data: {
        user: {
          id: user.id,
          email: showSensitiveData ? user.email : undefined,
          role: roleData?.name || "user",
          status: userData.status,
          email_verified: !!user.email_confirmed_at,
          created_at: showSensitiveData ? user.created_at : undefined,
        },
      },
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
