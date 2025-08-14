"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ExternalLink, FileText, BookOpen, PenTool, LinkIcon, RefreshCw } from "lucide-react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"

const classNames = {
  "ap-precalc": "AP PreCalc",
  "math-1-period-1": "Math 1: Period 1",
  "math-1-honors": "Math 1 Honors",
  "math-1-period-4": "Math 1: Period 4",
  "math-1-period-5": "Math 1: Period 5",
}

const sectionConfig = {
  info: { title: "Important Class Information", icon: FileText, color: "text-blue-600" },
  notes: { title: "Notes", icon: BookOpen, color: "text-green-600" },
  study_guides: { title: "Study Guide Answer Keys", icon: PenTool, color: "text-purple-600" },
  classwork: { title: "Classwork Information", icon: FileText, color: "text-orange-600" },
  misc: { title: "Miscellaneous Links", icon: LinkIcon, color: "text-red-600" },
}

export default function ClassPage({ params }: { params: { slug: string } }) {
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadContent()

    // Listen for storage changes from admin panel
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "ms-g-website-content" && e.newValue) {
        try {
          const newContent = JSON.parse(e.newValue)
          setContent(newContent)
        } catch (err) {
          console.warn("Failed to parse updated content:", err)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("Loading content for class:", params.slug)

      // Always try server first, then fall back to localStorage
      let serverContent = null
      try {
        const response = await fetch("/api/content", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })
        if (response.ok) {
          serverContent = await response.json()
          console.log("Loaded from server, classes available:", Object.keys(serverContent.classes))
          // Save to localStorage
          localStorage.setItem("ms-g-website-content", JSON.stringify(serverContent))
          setContent(serverContent)
          return
        }
      } catch (serverError) {
        console.warn("Server load failed, trying localStorage:", serverError)
      }

      // Fallback to localStorage
      const localContent = localStorage.getItem("ms-g-website-content")
      if (localContent) {
        const parsedContent = JSON.parse(localContent)
        console.log("Loaded from localStorage, classes available:", Object.keys(parsedContent.classes))
        setContent(parsedContent)
      } else {
        setError("No content available")
      }
    } catch (err) {
      setError("Failed to load content")
      console.error("Load error for class", params.slug, ":", err)
    } finally {
      setLoading(false)
    }
  }

  const className = classNames[params.slug as keyof typeof classNames]

  if (!className) {
    notFound()
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-lg">Loading class content...</span>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load class content</p>
          <button onClick={loadContent} className="px-4 py-2 bg-purple-600 text-white rounded">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const classData = content.classes[params.slug]

  if (!classData) {
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-purple-700 mb-2">{classData.name}</h1>
            <p className="text-gray-600">Find all resources and information for this class below.</p>
          </div>
          <Button onClick={loadContent} variant="outline" className="flex items-center bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Content
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(sectionConfig).map(([sectionType, config]) => {
          const sectionContent = classData.sections[sectionType] || []
          const IconComponent = config.icon

          return (
            <Card key={sectionType} className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className={`text-2xl font-bold flex items-center ${config.color}`}>
                  <IconComponent className="h-6 w-6 mr-2" />
                  {config.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sectionContent.length > 0 ? (
                  <div className="space-y-4">
                    {sectionContent.map((item: any) => (
                      <div key={item.id} className="p-4 bg-white rounded-lg shadow-sm border">
                        <div className="flex justify-between items-start mb-2">
                          {item.title && <h3 className="font-semibold text-gray-800">{item.title}</h3>}
                          {item.dateAdded && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {new Date(item.dateAdded).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {item.content && <p className="text-gray-700 mb-3 whitespace-pre-line">{item.content}</p>}
                        {item.linkUrl && (
                          <Link
                            href={item.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Resource <ExternalLink className="ml-1 h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No content available for this section yet. Content will appear here once added by Ms. G.
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
