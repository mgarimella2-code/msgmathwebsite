"use client"

import { useEffect, useState } from "react"
import { getServerContent } from "@/lib/content-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from 'lucide-react'

export default function AnnouncementsPage() {
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError("")
      const serverContent = await getServerContent()
      setContent(serverContent)
    } catch (err) {
      setError("Failed to load content")
      console.error("Load error:", err)
    } finally {
      setLoading(false)
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
          <button onClick={loadContent} className="px-4 py-2 bg-purple-600 text-white rounded">
            Try Again
          </button>
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

      <div className="space-y-6">
        {announcements.length > 0 ? (
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
