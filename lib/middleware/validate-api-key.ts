import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "../supabase/server"

export const validateApiKey = async (req: NextRequest) => {
  const apiKey = req.headers.get("x-api-key")

  if (!apiKey) {
    return NextResponse.json(
      {
        status: "error",
        message: "Unauthorized: API key tidak ditemukan",
      },
      { status: 200 },
    )
  }

  try {
    // Check API key in database first
    const supabase = createServerSupabaseClient()

    const { data: apiKeyData, error } = await supabase
      .from("api_keys")
      .select("id, key_name, permissions, is_active, expires_at, user_id")
      .eq("key_value", apiKey)
      .eq("is_active", true)
      .single()

    if (error || !apiKeyData) {
      // Fallback to environment variable for development
      if (process.env.NODE_ENV === "development" && apiKey === process.env.API_KEY) {
        return null // Allow development API key
      }

      return NextResponse.json(
        {
          status: "error",
          message: "Unauthorized: API key tidak valid",
        },
        { status: 200 },
      )
    }

    // Check if API key is expired
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return NextResponse.json(
        {
          status: "error",
          message: "Unauthorized: API key sudah expired",
        },
        { status: 200 },
      )
    }

    // Update last_used_at
    await supabase
      .from("api_keys")
      .update({
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", apiKeyData.id)

    // Add API key info to request for later use
    // You can access this in your route handlers
    req.headers.set("x-api-key-id", apiKeyData.id.toString())
    req.headers.set("x-api-key-permissions", JSON.stringify(apiKeyData.permissions))

    return null // No error, continue
  } catch (error) {
    console.error("API key validation error:", error)

    // Fallback to environment variable
    if (apiKey === process.env.API_KEY) {
      return null
    }

    return NextResponse.json(
      {
        status: "error",
        message: "Unauthorized: Terjadi kesalahan validasi API key",
      },
      { status: 200 },
    )
  }
}

// Helper function to check API key permissions
export const hasPermission = (req: NextRequest, permission: string): boolean => {
  const permissions = req.headers.get("x-api-key-permissions")
  if (!permissions) return false

  try {
    const perms = JSON.parse(permissions)
    return perms.includes(permission) || perms.includes("*")
  } catch {
    return false
  }
}
