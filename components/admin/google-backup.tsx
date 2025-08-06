"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, Cloud, Copy, ExternalLink } from 'lucide-react'

export default function GoogleBackup() {
  const [backupData, setBackupData] = useState("")
  const [restoreData, setRestoreData] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const createBackup = async () => {
    try {
      setLoading(true)
      setError("")
      
      const response = await fetch('/api/google-backup')
      if (!response.ok) throw new Error('Failed to create backup')
      
      const backup = await response.json()
      const backupString = JSON.stringify(backup, null, 2)
      setBackupData(backupString)
      setMessage("Backup created! Copy this data to save in Google Drive.")
    } catch (err) {
      setError("Failed to create backup")
    } finally {
      setLoading(false)
    }
  }

  const restoreBackup = async () => {
    try {
      setLoading(true)
      setError("")
      
      const parsedData = JSON.parse(restoreData)
      
      const response = await fetch('/api/google-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
      })
      
      if (!response.ok) throw new Error('Failed to restore backup')
      
      const result = await response.json()
      setMessage("Backup restored successfully! Refresh the page to see changes.")
      setRestoreData("")
    } catch (err) {
      setError("Failed to restore backup. Check the data format.")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(backupData)
    setMessage("Copied to clipboard! Now paste this into a Google Doc for backup.")
  }

  const downloadBackup = () => {
    const blob = new Blob([backupData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ms-g-website-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setMessage("Backup downloaded! Upload this file to Google Drive for safekeeping.")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cloud className="h-5 w-5 mr-2" />
            Google Drive Backup Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">How to Backup to Google Drive:</h3>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Click "Create Backup" below</li>
                <li>2. Copy the backup data</li>
                <li>3. Go to Google Drive and create a new Google Doc</li>
                <li>4. Paste the backup data into the document</li>
                <li>5. Save the document as "Ms G Website Backup [Date]"</li>
              </ol>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">How to Restore from Google Drive:</h3>
              <ol className="text-sm text-green-700 space-y-1">
                <li>1. Open your backup Google Doc</li>
                <li>2. Copy all the backup data</li>
                <li>3. Paste it in the "Restore" section below</li>
                <li>4. Click "Restore from Backup"</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Create Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Create a backup of all your website content to save in Google Drive.
          </p>
          
          <Button onClick={createBackup} disabled={loading} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Backup'}
          </Button>
          
          {backupData && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button size="sm" onClick={copyToClipboard} className="flex items-center">
                  <Copy className="h-4 w-4 mr-1" />
                  Copy for Google Drive
                </Button>
                <Button size="sm" onClick={downloadBackup} variant="outline" className="flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  Download File
                </Button>
              </div>
              
              <Textarea
                value={backupData}
                readOnly
                rows={8}
                className="font-mono text-xs"
                placeholder="Backup data will appear here..."
              />
              
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <ExternalLink className="h-4 w-4" />
                <a 
                  href="https://drive.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Open Google Drive to save this backup
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Restore from Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Paste backup data from your Google Drive to restore your website content.
          </p>
          
          <Textarea
            value={restoreData}
            onChange={(e) => setRestoreData(e.target.value)}
            placeholder="Paste your backup data from Google Drive here..."
            rows={8}
            className="font-mono text-xs"
          />
          
          <Button 
            onClick={restoreBackup} 
            disabled={!restoreData || loading} 
            className="flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            {loading ? 'Restoring...' : 'Restore from Backup'}
          </Button>
        </CardContent>
      </Card>

      {/* Messages */}
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

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <a 
              href="https://drive.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Cloud className="h-5 w-5 mr-3 text-blue-600" />
              <div>
                <div className="font-medium text-blue-800">Google Drive</div>
                <div className="text-sm text-blue-600">Save your backups here</div>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto text-blue-600" />
            </a>
            
            <a 
              href="https://docs.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <FileText className="h-5 w-5 mr-3 text-green-600" />
              <div>
                <div className="font-medium text-green-800">Google Docs</div>
                <div className="text-sm text-green-600">Create backup documents</div>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto text-green-600" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
