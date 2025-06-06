import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateApiKey } from "@/lib/middleware/validate-api-key"
import { rateLimit } from "@/lib/middleware/rate-limit"
import { createErrorResponse } from "@/lib/utils/error-handler"
import { logActivity } from "@/lib/utils/logger"
import { z } from "zod"

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, { message: "Password lama tidak boleh kosong" }),
    new_password: z
      .string()
      .min(8, { message: "Password baru minimal 8 karakter" })
      .regex(/[A-Z]/, { message: "Password baru harus mengandung minimal 1 huruf besar" })
      .regex(/[0-9]/, { message: "Password baru harus mengandung minimal 1 angka" }),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Password baru dan konfirmasi password tidak cocok",
    path: ["confirm_password"],
  })

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    const apiKeyError = await validateApiKey(req)
    if (apiKeyError) return apiKeyError

    // Apply rate limiting (5 requests per hour)
    const rateLimitError = await rateLimit(req, 5, 3600)
    if (rateLimitError) return rateLimitError

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

    // Parse request body
    const body = await req.json()

    // Validate input
    const validationResult = changePasswordSchema.safeParse(body)
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

    const { current_password, new_password } = validationResult.data

    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Get user from token
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        {
          status: "error",
          message: "Unauthorized: Token tidak valid",
        },
        { status: 200 },
      )
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: current_password,
    })

    if (signInError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Password lama tidak benar",
        },
        { status: 200 },
      )
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: new_password,
    })

    if (updateError) {
      return createErrorResponse(updateError)
    }

    // Log activity
    await logActivity(user.id, "change_password", {}, req)

    return NextResponse.json({
      status: "success",
      message: "Password berhasil diubah",
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
