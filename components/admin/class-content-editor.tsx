"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Plus, Trash2, RefreshCw, FileText, BookOpen, PenTool, LinkIcon, Download, Upload } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getContent,
  updateContent,
  addClassContentItem,
  removeClassContentItem,
  updateClassContentItem,
  loadContentFromStorage,
} from "@/lib/content-store"
import ExportImport from "./export-import"

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

export default function ClassContentEditor() {
  const [content, setContent] = useState(getContent())
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [selectedClass, setSelectedClass] = useState("ap-precalc")

  useEffect(() => {
    loadContentFromStorage()
    setContent(getContent())
  }, [])

  const refreshContent = () => {
    setContent(getContent())
  }

  const handleAddItem = (sectionType: string) => {
    setError("") // Clear any previous errors
    
    try {
      const newItem = {
        title: "New Item",
        content: "Click to edit this content...",
        linkUrl: "",
      }

      console.log("Adding item to:", selectedClass, sectionType) // Debug log
      
      const result = addClassContentItem(selectedClass, sectionType, newItem)
      
      console.log("Add result:", result) // Debug log
      
      if (result.success) {
        refreshContent()
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(`Failed to add item: ${result.error || "Unknown error"}`)
      }
    } catch (err) {
      console.error("Error adding item:", err)
      setError("Failed to add item - check console for details")
    }
  }

  const handleUpdateItem = (sectionType: string, itemId: number, field: string, value: string) => {
    try {
      const result = updateClassContentItem(selectedClass, sectionType, itemId, { [field]: value })
      if (result.success) {
        refreshContent()
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } else {
        setError("Failed to update item")
      }
    } catch (err) {
      setError("Failed to update item")
    }
  }

  const handleRemoveItem = (sectionType: string, itemId: number) => {
    try {
      const result = removeClassContentItem(selectedClass, sectionType, itemId)
      if (result.success) {
        refreshContent()
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError("Failed to remove item")
      }
    } catch (err) {
      setError("Failed to remove item")
    }
  }

  const handleSaveAnnouncements = () => {
    if (!content) return
    try {
      updateContent(content)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError("Failed to save announcements")
    }
  }

  const addAnnouncement = () => {
    const newAnnouncement = {
      id: Date.now(),
      title: "New Announcement",
      content: "Enter your announcement content here...",
      date: new Date().toISOString().split("T")[0],
    }
    setContent({
      ...content,
      announcements: [newAnnouncement, ...content.announcements],
    })
  }

  const updateAnnouncement = (index: number, field: string, value: string) => {
    const newAnnouncements = [...content.announcements]
    newAnnouncements[index] = { ...newAnnouncements[index], [field]: value }
    setContent({ ...content, announcements: newAnnouncements })
  }

  const removeAnnouncement = (index: number) => {
    const newAnnouncements = content.announcements.filter((_: any, i: number) => i !== index)
    setContent({ ...content, announcements: newAnnouncements })
  }

  const currentClass = content.classes[selectedClass]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-700">Content Editor</h1>
        <p className="text-gray-600">
          Add and manage content for your classes - use Export/Import to sync across devices
        </p>
      </div>

      {saved && (
        <Alert className="mb-6">
          <AlertDescription>✅ Content saved successfully! Use Export/Import to sync to other devices.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="classes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="classes">Class Content</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="sync">Sync Devices</TabsTrigger>
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
                          className="flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
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
              <Button onClick={handleSaveAnnouncements} className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save Announcements
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

        {/* Sync Devices */}
        <TabsContent value="sync">
          <ExportImport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
