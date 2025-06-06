import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateApiKey, hasPermission } from "@/lib/middleware/validate-api-key"
import { createErrorResponse } from "@/lib/utils/error-handler"

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

    // Get query parameters
    const url = new URL(req.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")

    const offset = (page - 1) * limit

    const {
      data: logs,
      error,
      count,
    } = await supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return createErrorResponse(error)
    }

    return NextResponse.json({
      status: "success",
      message: "Audit logs berhasil diambil",
      data: logs,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
