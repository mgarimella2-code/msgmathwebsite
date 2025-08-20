"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Save,
  Plus,
  Trash2,
  RefreshCw,
  FileText,
  BookOpen,
  PenTool,
  LinkIcon,
  Wifi,
  WifiOff,
  Database,
  Clock,
  CheckCircle,
  Settings,
  Bug,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveContentToStorage, loadContentFromStorage, checkForUpdates } from "@/lib/storage"
import DatabaseSetup from "./database-setup"

const classes = [
  { name: "AP PreCalc", slug: "ap-precalc" },
  { name: "Math 1: Period 1", slug: "math-1-period-1" },
  { name: "Math 1 Honors", slug: "math-1-honors" },
  { name: "Math 1: Period 4", slug: "math-1-period-4" },
  { name: "Math 1: Period 5", slug: "math-1-period-5" },
]

const sectionConfig = {
  info: { title: "Important Class Information", icon: FileText, color: "text-blue-600" },
  notes: { title: "Notes", icon: BookOpen, color: "text-green-600" },
  study_guides: { title: "Study Guide Answer Keys", icon: PenTool, color: "text-purple-600" },
  classwork: { title: "Classwork Information", icon: FileText, color: "text-orange-600" },
  misc: { title: "Miscellaneous Links", icon: LinkIcon, color: "text-red-600" },
}

export default function UniversalContentEditor() {
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [selectedClass, setSelectedClass] = useState("ap-precalc")
  const [isOnline, setIsOnline] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [storageType, setStorageType] = useState<string>("unknown")
  const [isPermanent, setIsPermanent] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    loadContent()

    // Check for updates every 30 seconds
    const interval = setInterval(checkForContentUpdates, 30000)

    // Monitor online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("🔍 Loading content...")
      const result = await loadContentFromStorage()

      if (result.success && result.content) {
        setContent(result.content)
        setLastUpdate(result.content._lastUpdate || new Date().toISOString())
        setStorageType(result.source)
        setIsPermanent(result.source === "database")
        console.log(`✅ Loaded content from ${result.source}`)

        // Store debug info
        setDebugInfo({
          loadedFrom: result.source,
          loadedAt: new Date().toISOString(),
          contentKeys: Object.keys(result.content),
          announcementCount: result.content.announcements?.length || 0,
          classCount: Object.keys(result.content.classes || {}).length,
        })
      } else {
        throw new Error(result.error || "Failed to load content")
      }
    } catch (err) {
      setError("Failed to load content")
      console.error("Load error:", err)
    } finally {
      setLoading(false)
    }
  }

  const checkForContentUpdates = async () => {
    if (!isOnline || !lastUpdate) return

    try {
      const result = await checkForUpdates(lastUpdate)
      if (result.hasUpdates && result.content) {
        setContent(result.content)
        setLastUpdate(result.content._lastUpdate || new Date().toISOString())
        console.log("Content updated from server")
      }
    } catch (err) {
      console.warn("Failed to check for updates:", err)
    }
  }

  const saveContent = async (newContent: any) => {
    try {
      setSaving(true)
      setError("")

      console.log("💾 Saving content...")
      const result = await saveContentToStorage(newContent)

      if (result.success) {
        console.log(`✅ Content saved to ${result.source}`)
        setLastUpdate(new Date().toISOString())
        setStorageType(result.source)
        setIsPermanent(result.permanent || false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)

        // Update debug info
        setDebugInfo({
          ...debugInfo,
          lastSavedTo: result.source,
          lastSavedAt: new Date().toISOString(),
          isPermanent: result.permanent,
        })
      } else {
        throw new Error("Failed to save content")
      }
    } catch (err) {
      setError("Failed to save content")
      console.error("Save error:", err)
    } finally {
      setSaving(false)
    }
  }

  const testDatabaseDirectly = async () => {
    try {
      console.log("🧪 Testing database directly...")

      // Test save
      const testContent = {
        ...content,
        _testSave: new Date().toISOString(),
        _testId: Math.random().toString(36).substr(2, 9),
      }

      const saveResponse = await fetch("/api/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testContent),
      })

      const saveResult = await saveResponse.json()
      console.log("🧪 Save test result:", saveResult)

      // Test load immediately after
      const loadResponse = await fetch(`/api/load-content?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })

      const loadResult = await loadResponse.json()
      console.log("🧪 Load test result:", loadResult)

      // Check if the test data matches
      const matches = loadResult.content?._testId === testContent._testId
      console.log("🧪 Data matches:", matches)

      alert(`Database Test Results:
Save: ${saveResult.success ? "✅ SUCCESS" : "❌ FAILED"}
Load: ${loadResult.success ? "✅ SUCCESS" : "❌ FAILED"}
Data Match: ${matches ? "✅ YES" : "❌ NO"}

${matches ? "Database is working!" : "Database has issues!"}`)
    } catch (error) {
      console.error("🧪 Database test failed:", error)
      alert(`Database test failed: ${error}`)
    }
  }

  const handleAddItem = async (sectionType: string) => {
    if (!content) return

    setError("")
    console.log("Adding item to:", selectedClass, sectionType)

    const newItem = {
      id: Date.now(),
      title: "New Item",
      content: "Click to edit this content...",
      linkUrl: "",
      dateAdded: new Date().toISOString().split("T")[0],
    }

    const currentItems = content.classes[selectedClass]?.sections[sectionType] || []
    const updatedItems = [newItem, ...currentItems]

    const updatedContent = {
      ...content,
      classes: {
        ...content.classes,
        [selectedClass]: {
          ...content.classes[selectedClass],
          sections: {
            ...content.classes[selectedClass].sections,
            [sectionType]: updatedItems,
          },
        },
      },
    }

    setContent(updatedContent)
    await saveContent(updatedContent)
  }

  const handleUpdateItem = async (sectionType: string, itemId: number, field: string, value: string) => {
    if (!content) return

    const currentItems = content.classes[selectedClass]?.sections[sectionType] || []
    const updatedItems = currentItems.map((item: any) => (item.id === itemId ? { ...item, [field]: value } : item))

    const updatedContent = {
      ...content,
      classes: {
        ...content.classes,
        [selectedClass]: {
          ...content.classes[selectedClass],
          sections: {
            ...content.classes[selectedClass].sections,
            [sectionType]: updatedItems,
          },
        },
      },
    }

    setContent(updatedContent)
    await saveContent(updatedContent)
  }

  const handleRemoveItem = async (sectionType: string, itemId: number) => {
    if (!content) return

    const currentItems = content.classes[selectedClass]?.sections[sectionType] || []
    const updatedItems = currentItems.filter((item: any) => item.id !== itemId)

    const updatedContent = {
      ...content,
      classes: {
        ...content.classes,
        [selectedClass]: {
          ...content.classes[selectedClass],
          sections: {
            ...content.classes[selectedClass].sections,
            [sectionType]: updatedItems,
          },
        },
      },
    }

    setContent(updatedContent)
    await saveContent(updatedContent)
  }

  const handleSaveAnnouncements = async () => {
    if (!content) return
    await saveContent(content)
  }

  const addAnnouncement = () => {
    if (!content) return

    const newAnnouncement = {
      id: Date.now(),
      title: "New Announcement",
      content: "Enter your announcement content here...",
      date: new Date().toISOString().split("T")[0],
    }

    const updatedContent = {
      ...content,
      announcements: [newAnnouncement, ...content.announcements],
    }

    setContent(updatedContent)
  }

  const updateAnnouncement = (index: number, field: string, value: string) => {
    if (!content) return

    const newAnnouncements = [...content.announcements]
    newAnnouncements[index] = { ...newAnnouncements[index], [field]: value }
    setContent({ ...content, announcements: newAnnouncements })
  }

  const removeAnnouncement = (index: number) => {
    if (!content) return

    const newAnnouncements = content.announcements.filter((_: any, i: number) => i !== index)
    setContent({ ...content, announcements: newAnnouncements })
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-lg">Loading content...</span>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load content.
            <Button onClick={loadContent} className="ml-2" size="sm">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const currentClass = content.classes[selectedClass]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-purple-700">Content Editor</h1>
            <div className="flex items-center space-x-4 mt-2">
              {isOnline ? (
                <span className="flex items-center text-green-600">
                  <Wifi className="h-4 w-4 mr-2" />
                  Online
                </span>
              ) : (
                <span className="flex items-center text-orange-600">
                  <WifiOff className="h-4 w-4 mr-2" />
                  Offline
                </span>
              )}

              <span className="flex items-center text-gray-600">
                {isPermanent ? (
                  <>
                    <Database className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-green-600">Permanent Storage</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2 text-orange-600" />
                    <span className="text-orange-600">24-Hour Storage</span>
                  </>
                )}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={testDatabaseDirectly} variant="outline" className="flex items-center bg-yellow-50">
              <Bug className="h-4 w-4 mr-2" />🧪 Test Database
            </Button>
            <Button onClick={loadContent} variant="outline" className="flex items-center bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Bug className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>🔍 Debug Info:</strong>
            <div className="text-sm mt-1 space-y-1">
              <div>
                📖 Loaded from: <strong>{debugInfo.loadedFrom}</strong>
              </div>
              <div>
                💾 Last saved to: <strong>{debugInfo.lastSavedTo || "Not saved yet"}</strong>
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
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Storage Status Alert */}
      {isPermanent ? (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>✅ Permanent Storage Active:</strong> Your changes are saved permanently and will never be lost!
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>⚠️ Temporary Storage:</strong> Changes may be lost after 24 hours. Set up permanent storage below.
          </AlertDescription>
        </Alert>
      )}

      {saved && (
        <Alert className="mb-6">
          <AlertDescription>
            ✅ Content saved to {storageType}!{" "}
            {isPermanent ? "Changes are permanent." : "Changes may reset in 24 hours."}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            {error}
            <Button onClick={loadContent} className="ml-2" size="sm">
              Refresh
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="classes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="classes">Class Content</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="setup">
            <Settings className="h-4 w-4 mr-2" />
            Setup
          </TabsTrigger>
        </TabsList>

        {/* Class Content */}
        <TabsContent value="classes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Class to Edit</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.slug} value={cls.slug}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {currentClass && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-purple-700">
                Editing: {classes.find((c) => c.slug === selectedClass)?.name}
              </h2>

              {Object.entries(sectionConfig).map(([sectionType, config]) => {
                const sectionItems = currentClass.sections[sectionType] || []
                const IconComponent = config.icon

                return (
                  <Card key={sectionType}>
                    <CardHeader>
                      <CardTitle className={`flex items-center justify-between ${config.color}`}>
                        <div className="flex items-center">
                          <IconComponent className="h-6 w-6 mr-2" />
                          {config.title}
                        </div>
                        <Button
                          onClick={() => handleAddItem(sectionType)}
                          disabled={saving}
                          className="flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {saving ? "Adding..." : "Add Item"}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {sectionItems.length > 0 ? (
                        <div className="space-y-4">
                          {sectionItems.map((item: any, index: number) => (
                            <div key={item.id} className="p-4 border rounded-lg bg-gray-50">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold">Item {index + 1}</span>
                                  {item.dateAdded && (
                                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                      Added: {new Date(item.dateAdded).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveItem(sectionType, item.id)}
                                  disabled={saving}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <Label>Title</Label>
                                  <Input
                                    value={item.title || ""}
                                    onChange={(e) => handleUpdateItem(sectionType, item.id, "title", e.target.value)}
                                    placeholder="Enter title..."
                                  />
                                </div>

                                <div>
                                  <Label>Content/Description</Label>
                                  <Textarea
                                    value={item.content || ""}
                                    onChange={(e) => handleUpdateItem(sectionType, item.id, "content", e.target.value)}
                                    placeholder="Enter description or instructions..."
                                    rows={3}
                                  />
                                </div>

                                <div>
                                  <Label>Link URL (optional)</Label>
                                  <Input
                                    value={item.linkUrl || ""}
                                    onChange={(e) => handleUpdateItem(sectionType, item.id, "linkUrl", e.target.value)}
                                    placeholder="https://docs.google.com/... (Google Drive link, etc.)"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-center py-8">
                          No items yet. Click "Add Item" to create your first entry.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Announcements */}
        <TabsContent value="announcements" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Announcements</h2>
            <div className="flex gap-2">
              <Button onClick={addAnnouncement} className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Announcement
              </Button>
              <Button onClick={handleSaveAnnouncements} disabled={saving} className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Announcements"}
              </Button>
            </div>
          </div>

          {content.announcements.map((announcement: any, index: number) => (
            <Card key={announcement.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold">Announcement {index + 1}</h3>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeAnnouncement(index)}
                    className="flex items-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={announcement.title}
                      onChange={(e) => updateAnnouncement(index, "title", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={announcement.date}
                      onChange={(e) => updateAnnouncement(index, "date", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={announcement.content}
                      onChange={(e) => updateAnnouncement(index, "content", e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          <DatabaseSetup />
        </TabsContent>
      </Tabs>
    </div>
  )
}
