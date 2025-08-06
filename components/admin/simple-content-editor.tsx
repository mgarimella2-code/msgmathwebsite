"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Plus, Trash2, RefreshCw, FileText, BookOpen, PenTool, LinkIcon, Download, Upload, Copy, ExternalLink } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export default function SimpleContentEditor() {
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [selectedClass, setSelectedClass] = useState("ap-precalc")
  const [exportData, setExportData] = useState("")
  const [importData, setImportData] = useState("")

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Try to load from localStorage first
      const localContent = localStorage.getItem('ms-g-website-content')
      if (localContent) {
        const parsedContent = JSON.parse(localContent)
        setContent(parsedContent)
        console.log('Loaded content from localStorage')
      } else {
        // Fallback to server
        const response = await fetch('/api/content', { cache: 'no-store' })
        if (response.ok) {
          const serverContent = await response.json()
          setContent(serverContent)
          // Save to localStorage for future use
          localStorage.setItem('ms-g-website-content', JSON.stringify(serverContent))
          console.log('Loaded content from server and saved to localStorage')
        }
      }
    } catch (err) {
      setError("Failed to load content")
      console.error("Load error:", err)
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async (newContent: any) => {
  try {
    setSaving(true)
    
    // Save to localStorage immediately
    localStorage.setItem('ms-g-website-content', JSON.stringify(newContent))
    
    // Try to save to server (but don't fail if it doesn't work)
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContent)
      })
      console.log('Saved to server successfully')
    } catch (serverError) {
      console.warn('Server save failed, but localStorage save succeeded:', serverError)
    }
    
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'ms-g-website-content',
      newValue: JSON.stringify(newContent)
    }))
    
    // Trigger custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('content-updated', {
      detail: { content: newContent }
    }))
    
    console.log('Content saved and events dispatched')
    
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    
  } catch (err) {
    setError("Failed to save content")
    console.error("Save error:", err)
  } finally {
    setSaving(false)
  }
}

  const handleAddItem = async (sectionType: string) => {
    if (!content) return
    
    setError("")
    
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
    const updatedItems = currentItems.map((item: any) => 
      item.id === itemId ? { ...item, [field]: value } : item
    )

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

  const updateWelcome = (field: string, value: string) => {
    if (!content) return
    
    const updatedContent = {
      ...content,
      welcome: { ...content.welcome, [field]: value },
    }
    setContent(updatedContent)
  }

  const updateContact = (field: string, value: string) => {
    if (!content) return
    
    const updatedContent = {
      ...content,
      contact: { ...content.contact, [field]: value },
    }
    setContent(updatedContent)
  }

  const saveHomepageSettings = async () => {
    if (!content) return
    await saveContent(content)
  }

  const updateImportantLink = (index: number, field: string, value: string) => {
    if (!content) return
    
    const newLinks = [...content.importantLinks]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setContent({ ...content, importantLinks: newLinks })
  }

  const addImportantLink = () => {
    if (!content) return
    
    const newLink = {
      id: Date.now(),
      title: "New Link",
      url: "https://example.com",
    }
    
    const updatedContent = {
      ...content,
      importantLinks: [...content.importantLinks, newLink],
    }
    
    setContent(updatedContent)
  }

  const removeImportantLink = (index: number) => {
    if (!content) return
    
    const newLinks = content.importantLinks.filter((_: any, i: number) => i !== index)
    setContent({ ...content, importantLinks: newLinks })
  }

  const handleExport = () => {
    if (!content) return
    
    const exportObj = {
      timestamp: new Date().toISOString(),
      content: content,
      version: "1.0"
    }
    
    const jsonData = JSON.stringify(exportObj, null, 2)
    setExportData(jsonData)
  }

  const handleImport = async () => {
    try {
      const parsedData = JSON.parse(importData)
      if (parsedData.content) {
        setContent(parsedData.content)
        await saveContent(parsedData.content)
        setImportData("")
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      setError("Invalid import data format")
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportData)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
        <h1 className="text-3xl font-bold text-purple-700">Content Editor</h1>
        <p className="text-gray-600">
          ✅ Changes save automatically! Use Export/Import to sync between devices.
        </p>
      </div>

      {saved && (
        <Alert className="mb-6">
          <AlertDescription>✅ Content saved successfully!</AlertDescription>
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
          <TabsTrigger value="sync">Device Sync</TabsTrigger>
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

        {/* Device Sync */}
        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Export for Other Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Export your content to copy to other devices or save as backup.
              </p>
              <Button onClick={handleExport} className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Content
              </Button>
              
              {exportData && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Exported Data:</label>
                    <Button size="sm" onClick={copyToClipboard} className="flex items-center">
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={exportData}
                    readOnly
                    rows={8}
                    className="font-mono text-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Import from Other Device
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Paste exported content from another device to sync your changes.
              </p>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste exported data here..."
                rows={8}
                className="font-mono text-xs"
              />
              <Button onClick={handleImport} disabled={!importData} className="flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Import Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
