"use client"
import { useState } from "react"
import { getContent, updateContent } from "@/lib/content-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Plus, Trash2 } from "lucide-react"

export default function ContentEditor() {
  const [content, setContent] = useState(getContent())
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateContent(content)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    // Trigger a page refresh to show changes
    window.location.reload()
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
    const newLinks = content.importantLinks.filter((_, i) => i !== index)
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
    const newAnnouncements = content.announcements.filter((_, i) => i !== index)
    setContent({ ...content, announcements: newAnnouncements })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-700">Content Editor</h1>
          <p className="text-gray-600">Edit your website content - changes will be visible to all visitors</p>
        </div>
        <Button onClick={handleSave} className="flex items-center">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {saved && (
        <Alert className="mb-6">
          <AlertDescription>✅ Content saved successfully! Changes are now live.</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="homepage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="links">Important Links</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
        </TabsList>

        {/* Homepage Content */}
        <TabsContent value="homepage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Section</CardTitle>
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
              <CardTitle>Contact Information</CardTitle>
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
            <Button onClick={addImportantLink} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>

          {content.importantLinks.map((link, index) => (
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
            <Button onClick={addAnnouncement} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Announcement
            </Button>
          </div>

          {content.announcements.map((announcement, index) => (
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

        {/* Classes */}
        <TabsContent value="classes">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">
                Class content editing will be available in the next update. For now, you can edit class content in the
                content.ts file.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
