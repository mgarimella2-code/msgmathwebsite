"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, CheckCircle, AlertTriangle, RefreshCw, TestTube } from "lucide-react"

export default function DatabaseSetup() {
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [hasDatabase, setHasDatabase] = useState<boolean | null>(null)

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      // Check if database environment variables exist
      const hasEnvVars = !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.POSTGRES_URL)
      setHasDatabase(hasEnvVars)
    } catch (err) {
      setHasDatabase(false)
    }
  }

  const testDatabaseConnection = async () => {
    try {
      setTesting(true)
      setTestResult(null)
      setError("")

      console.log("Testing database connection...")

      const response = await fetch("/api/test-database", {
        method: "GET",
      })

      const data = await response.json()
      setTestResult(data)

      if (data.success) {
        console.log("Database test successful!")
      } else {
        console.error("Database test failed:", data.error)
      }
    } catch (err) {
      console.error("Database test error:", err)
      setTestResult({
        success: false,
        error: "Test request failed",
        details: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setTesting(false)
    }
  }

  const setupDatabase = async () => {
    try {
      setLoading(true)
      setError("")
      setResult(null)

      console.log("Setting up database...")

      const response = await fetch("/api/setup-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
        })
        setHasDatabase(true)
        console.log("Database setup successful!")
      } else {
        throw new Error(data.error || "Setup failed")
      }
    } catch (err) {
      console.error("Database setup error:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-700">
            <Database className="h-6 w-6 mr-2" />
            Database Setup for Permanent Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">What this does:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Creates a database table for permanent content storage</li>
              <li>• Ensures your changes are never lost (even after 24+ hours)</li>
              <li>• Enables cross-device syncing for all users</li>
              <li>• Sets up automatic backups</li>
            </ul>
          </div>

          {/* Test Database Connection */}
          <div className="space-y-3">
            <Button
              onClick={testDatabaseConnection}
              disabled={testing}
              variant="outline"
              className="w-full flex items-center justify-center bg-transparent"
            >
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing connection...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Database Connection
                </>
              )}
            </Button>

            {testResult && (
              <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                  <strong>{testResult.success ? "✅ Connection Successful!" : "❌ Connection Failed:"}</strong>
                  <br />
                  {testResult.message || testResult.error}
                  {testResult.details && (
                    <>
                      <br />
                      <span className="text-sm">Details: {testResult.details}</span>
                    </>
                  )}
                  {testResult.suggestion && (
                    <>
                      <br />
                      <span className="text-sm font-medium">💡 {testResult.suggestion}</span>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Setup Database Button */}
          {testResult?.success && !result?.success && (
            <Button onClick={setupDatabase} disabled={loading} className="w-full flex items-center justify-center">
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Setting up database...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Set Up Permanent Storage
                </>
              )}
            </Button>
          )}

          {result && result.success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>✅ Success!</strong> {result.message}
                <br />
                <span className="text-sm">Your changes will now be saved permanently!</span>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Setup Failed:</strong> {error}
                <br />
                <span className="text-sm">
                  The website will continue to work with 24-hour storage limits. Database features are optional.
                </span>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
            <strong>Troubleshooting:</strong> If the connection test fails, your database might be sleeping, have
            network restrictions, or need reconfiguration. The website works perfectly without database setup.
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Storage Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">Browser Storage</span>
              <span className="text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">Server Storage (24-hour)</span>
              <span className="text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">Database Storage (Permanent)</span>
              <span
                className={`flex items-center ${
                  result?.success ? "text-green-600" : testResult?.success ? "text-orange-600" : "text-gray-500"
                }`}
              >
                {result?.success ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Active
                  </>
                ) : testResult?.success ? (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Ready to Setup
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Not Available
                  </>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
