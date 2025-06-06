import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateApiKey, hasPermission } from "@/lib/middleware/validate-api-key"
import { createErrorResponse } from "@/lib/utils/error-handler"
import { logActivity } from "@/lib/utils/logger"
import { z } from "zod"

const createUserSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z
    .string()
    .min(8, { message: "Password minimal 8 karakter" })
    .regex(/[A-Z]/, { message: "Password harus mengandung minimal 1 huruf besar" })
    .regex(/[0-9]/, { message: "Password harus mengandung minimal 1 angka" }),
  role_id: z.number().int().positive().default(1),
})

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  role_id: z.number().int().positive().optional(),
  status: z.enum(["pending", "active", "blocked"]).optional(),
})

// GET - List users
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
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const search = url.searchParams.get("search") || ""

    const offset = (page - 1) * limit

    // Build query
    const query = supabase
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
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Get auth users data
    const { data: authUsers } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: limit,
    })

    // Get users from public.users
    const { data: users, error, count } = await query

    if (error) {
      return createErrorResponse(error)
    }

    // Merge auth data with public data
    const mergedUsers = users?.map((user) => {
      const authUser = authUsers.users.find((au) => au.id === user.id)
      return {
        ...user,
        email: authUser?.email,
        email_verified: !!authUser?.email_confirmed_at,
        last_sign_in: authUser?.last_sign_in_at,
      }
    })

    // Filter by search if provided
    const filteredUsers = search
      ? mergedUsers?.filter((user) => user.email?.toLowerCase().includes(search.toLowerCase()))
      : mergedUsers

    return NextResponse.json({
      status: "success",
      message: "Data pengguna berhasil diambil",
      data: {
        users: filteredUsers,
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      },
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}

// POST - Create user
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
    const validationResult = createUserSchema.safeParse(body)

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

    const { email, password, role_id } = validationResult.data

    const supabase = createServerSupabaseClient()

    // Create user in auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm for admin created users
    })

    if (authError) {
      return createErrorResponse(authError)
    }

    // Update role in public.users (trigger should have created the record)
    const { error: updateError } = await supabase
      .from("users")
      .update({
        role_id,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", authUser.user.id)

    if (updateError) {
      return createErrorResponse(updateError)
    }

    // Log activity
    await logActivity(null, "admin_create_user", { email, role_id }, req)

    return NextResponse.json({
      status: "success",
      message: "Pengguna berhasil dibuat",
      data: {
        id: authUser.user.id,
        email: authUser.user.email,
        role_id,
      },
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
