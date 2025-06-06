import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateApiKey, hasPermission } from "@/lib/middleware/validate-api-key"
import { createErrorResponse } from "@/lib/utils/error-handler"
import { logActivity } from "@/lib/utils/logger"
import { z } from "zod"

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  role_id: z.number().int().positive().optional(),
  status: z.enum(["pending", "active", "blocked"]).optional(),
})

// GET - Get single user
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Get user from auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(params.id)

    if (authError) {
      return createErrorResponse(authError)
    }

    // Get user from public.users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        `
        id,
        status,
        created_at,
        updated_at,
        roles (
          id,
          name,
          description
        )
      `,
      )
      .eq("id", params.id)
      .single()

    if (userError) {
      return createErrorResponse(userError)
    }

    return NextResponse.json({
      status: "success",
      message: "Data pengguna berhasil diambil",
      data: {
        ...userData,
        email: authUser.user.email,
        email_verified: !!authUser.user.email_confirmed_at,
        last_sign_in: authUser.user.last_sign_in_at,
      },
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

// PUT - Update user
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
    const validationResult = updateUserSchema.safeParse(body)

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

    const { email, role_id, status } = validationResult.data

    const supabase = createServerSupabaseClient()

    // Update auth user if email provided
    if (email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(params.id, { email })

      if (authError) {
        return createErrorResponse(authError)
      }
    }

    // Update public.users
    const updateData: any = { updated_at: new Date().toISOString() }
    if (role_id) updateData.role_id = role_id
    if (status) updateData.status = status

    const { error: updateError } = await supabase.from("users").update(updateData).eq("id", params.id)

    if (updateError) {
      return createErrorResponse(updateError)
    }

    // Log activity
    await logActivity(null, "admin_update_user", { user_id: params.id, changes: validationResult.data }, req)

    return NextResponse.json({
      status: "success",
      message: "Data pengguna berhasil diperbarui",
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

// DELETE - Delete user
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

    // Delete from auth (this will cascade to public.users via foreign key)
    const { error } = await supabase.auth.admin.deleteUser(params.id)

    if (error) {
      return createErrorResponse(error)
    }

    // Log activity
    await logActivity(null, "admin_delete_user", { user_id: params.id }, req)

    return NextResponse.json({
      status: "success",
      message: "Pengguna berhasil dihapus",
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
