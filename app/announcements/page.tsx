"use client"

import { useEffect, useState } from "react"
import { getContent, loadContentFromStorage } from "@/lib/content-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnnouncementsPage() {
  const [content, setContent] = useState(getContent())

  useEffect(() => {
    loadContentFromStorage()
    setContent(getContent())
    
    // Listen for content updates
    const handleStorageChange = () => {
      setContent(getContent())
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const { announcements } = content

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-purple-700 mb-2">Announcements</h1>
        <p className="text-gray-600">Stay up to date with important class announcements and updates.</p>
      </div>

      <div className="space-y-6">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
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
