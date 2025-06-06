import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory rate limiting for development
// In production, use Redis or similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export const rateLimit = async (req: NextRequest, limit = 10, window = 60) => {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const key = `${ip}:${req.nextUrl.pathname}`
  const now = Date.now()
  const windowMs = window * 1000

  // Clean up old entries
  for (const [k, v] of rateLimitMap.entries()) {
    if (now > v.resetTime) {
      rateLimitMap.delete(k)
    }
  }

  const current = rateLimitMap.get(key)

  if (!current) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return null
  }

  if (now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return null
  }

  current.count++

  if (current.count > limit) {
    return NextResponse.json(
      {
        status: "error",
        message: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(current.resetTime / 1000).toString(),
        },
      },
    )
  }

  return null
}
