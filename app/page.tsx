"use client"

import { useEffect, useState } from "react"
import { getContent, loadContentFromStorage } from "@/lib/content-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ExternalLink } from 'lucide-react'

export default function HomePage() {
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

  const { welcome, contact, importantLinks } = content

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-purple-700">{welcome.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-700 leading-relaxed">{welcome.content}</p>
        </CardContent>
      </Card>

      {/* Important Links Section */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-700">Important Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {importantLinks.map((link) => (
              <Link
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <span className="font-medium text-gray-800">{link.title}</span>
                <ExternalLink className="h-4 w-4 text-gray-500" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Calendar Section */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-gray-600 mb-4">
                📅 <strong>Weekly Schedule</strong>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                The Google Doc cannot be embedded here due to privacy settings.
              </p>
              <Link
                href="https://docs.google.com/document/d/1vHaPr962yHnKlVPTMlyPC4bIUZH7IkNRUATfqTXV9yc/edit?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Weekly Schedule <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info Section */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-orange-700 flex items-center">
            <span className="mr-2">📧</span>
            {contact.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Email Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
              <h3 className="font-semibold text-orange-700 mb-2 flex items-center">
                <span className="mr-2">✉️</span>
                Email
              </h3>
              <p className="text-gray-700">
                Feel free to email me at anytime at{" "}
                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800 font-medium underline">
                  {contact.email}
                </a>
              </p>
            </div>

            {/* Office Hours Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
              <h3 className="font-semibold text-green-700 mb-2 flex items-center">
                <span className="mr-2">🕐</span>
                Office Hours
              </h3>
              <p className="text-gray-700">{contact.officeHours}</p>
              <p className="text-sm text-gray-600 mt-1">Find me in room 230!</p>
            </div>

            {/* Tutoring Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
              <h3 className="font-semibold text-purple-700 mb-2 flex items-center">
                <span className="mr-2">📚</span>
                Tutoring
              </h3>
              <p className="text-gray-700">
                <strong>{contact.tutoring}</strong>
              </p>
              <p className="text-sm text-gray-600 mt-1">Extra help available!</p>
            </div>

            {/* Make-up Tests Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
                <span className="mr-2">📝</span>
                Make-up Quizzes & Tests
              </h3>
              <p className="text-gray-700">
                <strong>{contact.makeupTests}</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
