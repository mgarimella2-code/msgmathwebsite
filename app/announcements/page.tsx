"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Bug, AlertTriangle } from "lucide-react"
import { loadContentFromStorage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AnnouncementsPage() {
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("📢 ANNOUNCEMENTS: Loading content...")
      const result = await loadContentFromStorage()

      if (result.success && result.content) {
        setContent(result.content)
        console.log(
          `📢 ANNOUNCEMENTS: Loaded from ${result.source}, announcements:`,
          result.content.announcements?.length || 0,
        )

        setDebugInfo({
          loadedFrom: result.source,
          loadedAt: new Date().toISOString(),
          announcementCount: result.content.announcements?.length || 0,
          isIncognito: !window.localStorage || window.localStorage.length === 0,
        })
      } else {
        throw new Error(result.error || "No content available")
      }
    } catch (err) {
      setError("Failed to load content")
      console.error("📢 ANNOUNCEMENTS: Load error:", err)
    } finally {
      setLoading(false)
    }
  }

  const testDirectDatabaseLoad = async () => {
    try {
      console.log("🧪 ANNOUNCEMENTS: Testing direct database load...")

      const response = await fetch(`/api/load-content?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })

      if (response.ok) {
        const result = await response.json()
        console.log("🧪 ANNOUNCEMENTS: Direct database result:", result)

        if (result.success && result.content) {
          setContent(result.content)
          alert(`✅ Direct database load successful!
Announcements found: ${result.content.announcements?.length || 0}
Latest announcement: ${result.content.announcements?.[0]?.title || "None"}`)
        } else {
          alert(`❌ Direct database load failed: ${result.error}`)
        }
      } else {
        alert(`❌ Database API failed: ${response.status}`)
      }
    } catch (error) {
      console.error("🧪 ANNOUNCEMENTS: Database test failed:", error)
      alert(`❌ Database test error: ${error}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-lg">Loading announcements...</span>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load announcements</p>
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

  const { announcements } = content

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-purple-700 mb-2">Announcements</h1>
        <p className="text-gray-600">Stay up to date with important class announcements and updates.</p>
      </div>

      {/* Debug Info for Announcements */}
      {debugInfo && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Bug className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex justify-between items-start">
              <div>
                <strong>📢 ANNOUNCEMENTS DEBUG:</strong>
                <div className="text-sm mt-1 space-y-1">
                  <div>
                    📖 Loaded from: <strong>{debugInfo.loadedFrom}</strong>
                  </div>
                  <div>
                    📊 Announcements found: <strong>{debugInfo.announcementCount}</strong>
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
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>🔒 Incognito Mode Detected:</strong> Loading announcements from {debugInfo.loadedFrom}. Found{" "}
            {debugInfo.announcementCount} announcements.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {announcements && announcements.length > 0 ? (
          announcements.map((announcement: any) => (
            <Card key={announcement.id} className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-700">{announcement.title}</CardTitle>
                <p className="text-sm text-gray-500">{new Date(announcement.date).toLocaleDateString()}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{announcement.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <p className="text-gray-500 italic">No announcements at this time. Check back later!</p>
              <Button onClick={testDirectDatabaseLoad} className="mt-4 bg-transparent" variant="outline">
                🧪 Test Database Load
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
