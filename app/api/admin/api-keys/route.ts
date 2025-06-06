import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateApiKey, hasPermission } from "@/lib/middleware/validate-api-key"
import { createErrorResponse } from "@/lib/utils/error-handler"
import { logActivity } from "@/lib/utils/logger"
import { z } from "zod"

const createApiKeySchema = z.object({
  key_name: z.string().min(1, { message: "Nama API key tidak boleh kosong" }),
  permissions: z.array(z.string()).default(["auth"]),
  expires_at: z.string().optional(),
})

// GET - List API keys
export async function GET(req: NextRequest) {
  try {
    // Validate API key
    const apiKeyError = await validateApiKey(req)
    if (apiKeyError) return apiKeyError

    // Check admin permission
    if (!hasPermission(req, "admin")) {
      return NextResponse.json(
        {
          status: "error",
          message: "Unauthorized: Tidak memiliki permission admin",
        },
        { status: 200 },
      )
    }

    const supabase = createServerSupabaseClient()

    const { data: apiKeys, error } = await supabase
      .from("api_keys")
      .select("id, key_name, permissions, is_active, expires_at, last_used_at, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      return createErrorResponse(error)
    }

    return NextResponse.json({
      status: "success",
      message: "Data API keys berhasil diambil",
      data: apiKeys,
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

// POST - Create new API key
export async function POST(req: NextRequest) {
  try {
    // Validate API key
    const apiKeyError = await validateApiKey(req)
    if (apiKeyError) return apiKeyError

    // Check admin permission
    if (!hasPermission(req, "admin")) {
      return NextResponse.json(
        {
          status: "error",
          message: "Unauthorized: Tidak memiliki permission admin",
        },
        { status: 200 },
      )
    }

    const body = await req.json()
    const validationResult = createApiKeySchema.safeParse(body)

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

    const { key_name, permissions, expires_at } = validationResult.data

    // Generate random API key
    const keyValue = `ak_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    const supabase = createServerSupabaseClient()

    const { data: newApiKey, error } = await supabase
      .from("api_keys")
      .insert([
        {
          key_name,
          key_value: keyValue,
          permissions,
          expires_at: expires_at ? new Date(expires_at).toISOString() : null,
        },
      ])
      .select()
      .single()

    if (error) {
      return createErrorResponse(error)
    }

    // Log activity
    await logActivity(null, "create_api_key", { key_name, permissions }, req)

    return NextResponse.json({
      status: "success",
      message: "API key berhasil dibuat",
      data: {
        ...newApiKey,
        key_value: keyValue, // Only show once during creation
      },
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
