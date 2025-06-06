import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Test database connection
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("roles").select("count").limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "success",
      message: "API is healthy",
      data: {
        timestamp: new Date().toISOString(),
        database: "connected",
        version: "1.0.0",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
