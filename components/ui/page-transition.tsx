"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function PageTransition() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true)
    }

    const handleStop = () => {
      setTimeout(() => {
        setIsLoading(false)
      }, 300)
    }

    // Tambahkan event listener untuk navigasi
    window.addEventListener("beforeunload", handleStart)
    window.addEventListener("load", handleStop)

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleStart)
      window.removeEventListener("load", handleStop)
    }
  }, [])

  // Reset loading state when pathname or search params change
  useEffect(() => {
    setIsLoading(false)
  }, [pathname, searchParams])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/20">
      <div className="h-full bg-primary animate-progress"></div>
    </div>
  )
}
