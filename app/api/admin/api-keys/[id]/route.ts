import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateApiKey, hasPermission } from "@/lib/middleware/validate-api-key"
import { createErrorResponse } from "@/lib/utils/error-handler"
import { logActivity } from "@/lib/utils/logger"

// DELETE - Deactivate API key
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    const { error } = await supabase
      .from("api_keys")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (error) {
      return createErrorResponse(error)
    }

    // Log activity
    await logActivity(null, "deactivate_api_key", { api_key_id: params.id }, req)

    return NextResponse.json({
      status: "success",
      message: "API key berhasil dinonaktifkan",
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
