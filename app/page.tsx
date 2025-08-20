"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ExternalLink, RefreshCw, Bug, AlertTriangle } from "lucide-react"
import { loadContentFromStorage, checkForUpdates } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HomePage() {
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    loadContent()

    // Check for updates every 30 seconds
    const interval = setInterval(checkForContentUpdates, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("🏠 HOMEPAGE: Loading content...")

      const result = await loadContentFromStorage()

      if (result.success && result.content) {
        setContent(result.content)
        setLastUpdate(result.content._lastUpdate || new Date().toISOString())
        console.log(`🏠 HOMEPAGE: Loaded content from ${result.source}`)

        // Store debug info for homepage
        setDebugInfo({
          loadedFrom: result.source,
          loadedAt: new Date().toISOString(),
          contentKeys: Object.keys(result.content),
          announcementCount: result.content.announcements?.length || 0,
          classCount: Object.keys(result.content.classes || {}).length,
          isIncognito: !window.localStorage || window.localStorage.length === 0,
          hasLocalStorage: !!window.localStorage,
          userAgent: navigator.userAgent.includes("Chrome") ? "Chrome" : "Other",
        })
      } else {
        throw new Error(result.error || "Failed to load content")
      }
    } catch (err) {
      setError("Failed to load content")
      console.error("🏠 HOMEPAGE: Load error:", err)
    } finally {
      setLoading(false)
    }
  }

  const checkForContentUpdates = async () => {
    if (!lastUpdate) return

    try {
      const result = await checkForUpdates(lastUpdate)
      if (result.hasUpdates && result.content) {
        setContent(result.content)
        setLastUpdate(result.content._lastUpdate || new Date().toISOString())
        console.log("🏠 HOMEPAGE: Content updated from server")
      }
    } catch (err) {
      console.warn("🏠 HOMEPAGE: Failed to check for updates:", err)
    }
  }

  const testDirectDatabaseLoad = async () => {
    try {
      console.log("🧪 HOMEPAGE: Testing direct database load...")

      const response = await fetch(`/api/load-content?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })

      if (response.ok) {
        const result = await response.json()
        console.log("🧪 HOMEPAGE: Direct database result:", result)

        if (result.success && result.content) {
          setContent(result.content)
          alert(`✅ Direct database load successful!
Announcements: ${result.content.announcements?.length || 0}
Classes: ${Object.keys(result.content.classes || {}).length}
Source: Database`)
        } else {
          alert(`❌ Direct database load failed: ${result.error}`)
        }
      } else {
        alert(`❌ Database API failed: ${response.status}`)
      }
    } catch (error) {
      console.error("🧪 HOMEPAGE: Database test failed:", error)
      alert(`❌ Database test error: ${error}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-lg">Loading...</span>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load content</p>
          <div className="flex gap-2 justify-center">
            <button onClick={loadContent} className="px-4 py-2 bg-purple-600 text-white rounded">
              Try Again
            </button>
            <button onClick={testDirectDatabaseLoad} className="px-4 py-2 bg-yellow-600 text-white rounded">
              🧪 Test Database
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { welcome, contact, importantLinks } = content

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Debug Info for Homepage */}
      {debugInfo && (
        <Alert className="border-blue-200 bg-blue-50">
          <Bug className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex justify-between items-start">
              <div>
                <strong>🏠 HOMEPAGE DEBUG:</strong>
                <div className="text-sm mt-1 space-y-1">
                  <div>
                    📖 Loaded from: <strong>{debugInfo.loadedFrom}</strong>
                  </div>
                  <div>
                    📊 Announcements: <strong>{debugInfo.announcementCount}</strong>
                  </div>
                  <div>
                    🏫 Classes: <strong>{debugInfo.classCount}</strong>
                  </div>
                  <div>
                    🕐 Loaded at: <strong>{debugInfo.loadedAt}</strong>
                  </div>
                  <div>
                    🔒 Incognito mode: <strong>{debugInfo.isIncognito ? "YES" : "NO"}</strong>
                  </div>
                </div>
              </div>
              <Button onClick={testDirectDatabaseLoad} size="sm" variant="outline" className="bg-yellow-50">
                🧪 Test DB
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Show if this is likely incognito mode */}
      {debugInfo?.isIncognito && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>🔒 Incognito Mode Detected:</strong> This page is loading from {debugInfo.loadedFrom}. If you made
            changes in admin, they should appear here if database is working.
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome Section */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-purple-700">{welcome?.title || "Welcome"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-700 leading-relaxed">
            {welcome?.content || "Welcome to Ms. G's math classes!"}
          </p>
        </CardContent>
      </Card>

      {/* Important Links Section */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-700">Important Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {importantLinks?.map((link: any) => (
              <Link
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <span className="font-medium text-gray-800">{link.title}</span>
                <ExternalLink className="h-4 w-4 text-gray-500" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Calendar Section */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
            <iframe
              src="https://docs.google.com/document/d/1vHaPr962yHnKlVPTMlyPC4bIUZH7IkNRUATfqTXV9yc/edit?usp=sharing&embedded=true"
              width="100%"
              height="100%"
              frameBorder="0"
              className="w-full h-full"
              title="Weekly Schedule"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info Section */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-orange-700 flex items-center">
            <span className="mr-2">📧</span>
            {contact?.title || "Contact Information"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Email Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
              <h3 className="font-semibold text-orange-700 mb-2 flex items-center">
                <span className="mr-2">✉️</span>
                Email
              </h3>
              <p className="text-gray-700">
                Feel free to email me at anytime at{" "}
                <a
                  href={`mailto:${contact?.email}`}
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  {contact?.email}
                </a>
              </p>
            </div>

            {/* Office Hours Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
              <h3 className="font-semibold text-green-700 mb-2 flex items-center">
                <span className="mr-2">🕐</span>
                Office Hours
              </h3>
              <p className="text-gray-700">{contact?.officeHours}</p>
              <p className="text-sm text-gray-600 mt-1">Find me in room 230!</p>
            </div>

            {/* Tutoring Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
              <h3 className="font-semibold text-purple-700 mb-2 flex items-center">
                <span className="mr-2">📚</span>
                Tutoring
              </h3>
              <p className="text-gray-700">
                <strong>{contact?.tutoring}</strong>
              </p>
              <p className="text-sm text-gray-600 mt-1">Extra help available!</p>
            </div>

            {/* Make-up Tests Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
                <span className="mr-2">📝</span>
                Make-up Quizzes & Tests
              </h3>
              <p className="text-gray-700">
                <strong>{contact?.makeupTests}</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
