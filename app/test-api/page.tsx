"use client"

import { useState } from "react"

export default function TestApiPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testEndpoint = async (name: string, method: string, endpoint: string, body?: any) => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || "dev-api-key-12345"

    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      }

      if (body) {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(endpoint, options)
      const data = await response.json()

      return {
        name,
        endpoint: `${method} ${endpoint}`,
        status: response.status,
        success: data.status === "success",
        data,
      }
    } catch (error) {
      return {
        name,
        endpoint: `${method} ${endpoint}`,
        status: 0,
        success: false,
        data: { error: error instanceof Error ? error.message : "Unknown error" },
      }
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setResults([])

    const tests = [
      {
        name: "Health Check",
        method: "GET",
        endpoint: "/api/health",
      },
      {
        name: "Register User",
        method: "POST",
        endpoint: "/api/auth/register",
        body: {
          email: "test@example.com",
          password: "Password123",
          repassword: "Password123",
        },
      },
      {
        name: "Login User",
        method: "POST",
        endpoint: "/api/auth/login",
        body: {
          email: "test@example.com",
          password: "Password123",
        },
      },
      {
        name: "List API Keys",
        method: "GET",
        endpoint: "/api/admin/api-keys",
      },
      {
        name: "List Users",
        method: "GET",
        endpoint: "/api/admin/users",
      },
    ]

    const testResults = []
    for (const test of tests) {
      const result = await testEndpoint(test.name, test.method, test.endpoint, test.body)
      testResults.push(result)
      setResults([...testResults])
      await new Promise((resolve) => setTimeout(resolve, 500)) // Delay between tests
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">🧪 API Testing Dashboard</h1>
          <p className="mt-2 text-gray-600">Test semua endpoint API untuk memastikan semuanya berfungsi</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Running Tests..." : "Run All Tests"}
            </button>
          </div>

          {results.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-8">Klik "Run All Tests" untuk memulai testing</p>
          )}

          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{result.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {result.success ? "✅ PASS" : "❌ FAIL"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.endpoint}</p>
                <p className="text-sm text-gray-600 mb-2">Status: {result.status}</p>
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-700 hover:text-gray-900">View Response</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Testing Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Testing Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/auth/register"
              className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50"
            >
              <h3 className="font-medium text-gray-900">📝 Register Page</h3>
              <p className="text-sm text-gray-600">Test user registration</p>
            </a>
            <a
              href="/auth/login"
              className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50"
            >
              <h3 className="font-medium text-gray-900">🔐 Login Page</h3>
              <p className="text-sm text-gray-600">Test user login</p>
            </a>
            <a
              href="/dashboard"
              className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50"
            >
              <h3 className="font-medium text-gray-900">👤 User Dashboard</h3>
              <p className="text-sm text-gray-600">Test user dashboard</p>
            </a>
            <a
              href="/admin"
              className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50"
            >
              <h3 className="font-medium text-gray-900">⚙️ Admin Panel</h3>
              <p className="text-sm text-gray-600">Test admin dashboard</p>
            </a>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Information:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p>API Key: {process.env.NEXT_PUBLIC_API_KEY || "dev-api-key-12345"}</p>
            <p>Environment: {process.env.NODE_ENV}</p>
            <p>Base URL: {typeof window !== "undefined" ? window.location.origin : "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
