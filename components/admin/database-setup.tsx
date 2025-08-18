"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, CheckCircle, AlertTriangle, RefreshCw, Info } from "lucide-react"

export default function DatabaseSetup() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
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

          {hasDatabase === false && (
            <Alert className="border-orange-200 bg-orange-50">
              <Info className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Database Not Configured:</strong> No database connection found. The website will work with
                24-hour storage limits. To enable permanent storage, you'll need to configure a database connection.
              </AlertDescription>
            </Alert>
          )}

          {hasDatabase === true && !result?.success && (
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
            <strong>Note:</strong> Database setup is optional. The website works perfectly without it, but changes may
            be lost after 24 hours. With database setup, changes are permanent forever.
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
                  result?.success ? "text-green-600" : hasDatabase === false ? "text-gray-500" : "text-orange-600"
                }`}
              >
                {result?.success ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Active
                  </>
                ) : hasDatabase === false ? (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Not Configured
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Not Set Up
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
