"use client"

import type React from "react"
import { useState } from "react"
import { useAdmin } from "@/contexts/admin-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminLogin() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAdmin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = login(password)
    if (!success) {
      setError("Incorrect password. Please try again.")
      setPassword("")
    } else {
      setError("")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-purple-700">Admin Login</CardTitle>
          <p className="text-center text-gray-600">Enter your password to edit website content</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter admin password"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Your admin password is:</strong> <code className="bg-blue-100 px-2 py-1 rounded">MsG2024!</code>
            </p>
            <p className="text-xs text-blue-600 mt-2">You can change this password in the admin-context.tsx file</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
