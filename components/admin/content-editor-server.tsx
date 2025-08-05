"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Plus, Trash2, RefreshCw } from "lucide-react"
import {
  getStoredContent,
  updateWelcomeContent,
  updateContactContent,
  updateImportantLinks,
  updateAnnouncements,
} from "@/lib/content-api"

export default function ContentEditorServer() {
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      const storedContent = await getStoredContent()
      setContent(storedContent)
    } catch (err) {
      setError("Failed to load content")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveWelcome = async () => {
    if (!content) return
    setSaving(true)
    try {
      const result = await updateWelcomeContent(content.welcome.title, content.welcome.content)
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError("Failed to save welcome content")
      }
    } catch (err) {
      setError("Failed to save welcome content")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveContact = async () => {
    if (!content) return
    setSaving(true)
    try {
      const result = await updateContactContent(content.contact)
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError("Failed to save contact content")
      }
    } catch (err) {
      setError("Failed to save contact content")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveLinks = async () => {
    if (!content) return
    setSaving(true)
    try {
      const result = await updateImportantLinks(content.importantLinks)
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError("Failed to save important links")
      }
    } catch (err) {
      setError("Failed to save important links")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAnnouncements = async () => {
    if (!content) return
    setSaving(true)
    try {
      const result = await updateAnnouncements(content.announcements)
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError("Failed to save announcements")
      }
    } catch (err) {
      setError("Failed to save announcements")
    } finally {
      setSaving(false)
    }
  }

  const updateWelcome = (field: string, value: string) => {
    setContent({
      ...content,
      welcome: { ...content.welcome, [field]: value },
    })
  }

  const updateContact = (field: string, value: string) => {
    setContent({
      ...content,
      contact: { ...content.contact, [field]: value },
    })
  }

  const updateImportantLink = (index: number, field: string, value: string) => {
    const newLinks = [...content.importantLinks]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setContent({ ...content, importantLinks: newLinks })
  }

  const addImportantLink = () => {
    const newLink = {
      id: Date.now(),
      title: "New Link",
      url: "https://example.com",
    }
    setContent({
      ...content,
      importantLinks: [...content.importantLinks, newLink],
    })
  }

  const removeImportantLink = (index: number) => {
    const newLinks = content.importantLinks.filter((_: any, i: number) => i !== index)
    setContent({ ...content, importantLinks: newLinks })
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
          <AlertDescription>Failed to load content. Please refresh the page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-700">Content Editor</h1>
        <p className="text-gray-600">
          Edit your website content - changes will be visible to ALL visitors on ANY device
        </p>
      </div>

      {saved && (
        <Alert className="mb-6">
          <AlertDescription>✅ Content saved successfully! Changes are now live for everyone.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="homepage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="links">Important Links</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        {/* Homepage Content */}
        <TabsContent value="homepage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Welcome Section
                <Button onClick={handleSaveWelcome} disabled={saving} className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Welcome"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="welcome-title">Title</Label>
                <Input
                  id="welcome-title"
                  value={content.welcome.title}
                  onChange={(e) => updateWelcome("title", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="welcome-content">Content</Label>
                <Textarea
                  id="welcome-content"
                  value={content.welcome.content}
                  onChange={(e) => updateWelcome("content", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Contact Information
                <Button onClick={handleSaveContact} disabled={saving} className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Contact"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contact-title">Section Title</Label>
                <Input
                  id="contact-title"
                  value={content.contact.title}
                  onChange={(e) => updateContact("title", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  value={content.contact.email}
                  onChange={(e) => updateContact("email", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contact-office">Office Hours</Label>
                <Input
                  id="contact-office"
                  value={content.contact.officeHours}
                  onChange={(e) => updateContact("officeHours", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contact-tutoring">Tutoring Schedule</Label>
                <Input
                  id="contact-tutoring"
                  value={content.contact.tutoring}
                  onChange={(e) => updateContact("tutoring", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contact-makeup">Make-up Tests</Label>
                <Input
                  id="contact-makeup"
                  value={content.contact.makeupTests}
                  onChange={(e) => updateContact("makeupTests", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Important Links */}
        <TabsContent value="links" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Important Links</h2>
            <div className="flex gap-2">
              <Button onClick={addImportantLink} className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
              <Button onClick={handleSaveLinks} disabled={saving} className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Links"}
              </Button>
            </div>
          </div>

          {content.importantLinks.map((link: any, index: number) => (
            <Card key={link.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold">Link {index + 1}</h3>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImportantLink(index)}
                    className="flex items-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Title</Label>
                    <Input value={link.title} onChange={(e) => updateImportantLink(index, "title", e.target.value)} />
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Input value={link.url} onChange={(e) => updateImportantLink(index, "url", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
      </Tabs>
    </div>
  )
}
