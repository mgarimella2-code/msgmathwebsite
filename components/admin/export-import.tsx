"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, Copy } from 'lucide-react'
import { getContent, updateContent } from "@/lib/content-store"

export default function ExportImport() {
  const [exportData, setExportData] = useState("")
  const [importData, setImportData] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleExport = () => {
    const content = getContent()
    const jsonData = JSON.stringify(content, null, 2)
    setExportData(jsonData)
    setMessage("Content exported! Copy this data to share across devices.")
  }

  const handleImport = () => {
    try {
      const parsedData = JSON.parse(importData)
      updateContent(parsedData)
      setMessage("Content imported successfully! Your changes are now live.")
      setError("")
      setImportData("")
    } catch (err) {
      setError("Invalid JSON data. Please check the format and try again.")
      setMessage("")
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportData)
    setMessage("Copied to clipboard! You can now paste this on another device.")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export Content (Copy to Other Devices)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Export your current content to copy it to other devices or as a backup.
          </p>
          <Button onClick={handleExport} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Current Content
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
            Import Content (From Other Devices)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Paste exported content from another device to sync your changes.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Paste Content Data:</label>
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste the exported JSON data here..."
              rows={8}
              className="font-mono text-xs"
            />
          </div>
          <Button onClick={handleImport} disabled={!importData} className="flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Import Content
          </Button>
        </CardContent>
      </Card>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How to Sync Across Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <span className="font-semibold text-blue-600">1.</span>
              <span>On your laptop: Make your changes, then click "Export Current Content"</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-semibold text-blue-600">2.</span>
              <span>Copy the exported data (use the Copy button)</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-semibold text-blue-600">3.</span>
              <span>On your phone: Go to admin, paste the data in "Import Content", and click Import</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-semibold text-blue-600">4.</span>
              <span>Your changes will now be visible on your phone and to all students!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
