import { getPageContent, getImportantLinks } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

export default async function HomePage() {
  // Get content with fallbacks
  const [welcomeContent, contactContent, importantLinks] = await Promise.all([
    getPageContent("homepage", "welcome").catch(() => []),
    getPageContent("homepage", "contact").catch(() => []),
    getImportantLinks().catch(() => []),
  ])

  const welcome = welcomeContent?.[0]
  const contact = contactContent?.[0]

  // Default content
  const defaultWelcome = {
    title: "Welcome",
    content:
      "Hi all! This is Ms. G's website :) You can find all the information for class you need here and a weekly schedule! But if you have a question remember you can always find me in room 230!",
  }

  const defaultContact = {
    title: "Ms. G's Contact Info :)",
    content: `Feel free to email me at anytime at garimella@hsamckinley.org

I am free during the school day from 6th period to 8th period​

Tutoring: Tuesday's and Thursday's  

Make-up Quizzes and Tests: Monday's afterschool OR schedule a time :)`,
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-purple-700">{welcome?.title || defaultWelcome.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
            {welcome?.content || defaultWelcome.content}
          </p>
        </CardContent>
      </Card>

      {/* Important Links Section */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-700">Important Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {importantLinks && importantLinks.length > 0 ? (
              importantLinks.map((link) => (
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
              ))
            ) : (
              <p className="text-gray-500 italic">Loading important links...</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Calendar Section */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
            <iframe
              src="https://docs.google.com/document/d/1vHaPr962yHnKlVPTMlyPC4bIUZH7IkNRUATfqTXV9yc/edit?usp=sharing&embedded=true"
              width="100%"
              height="100%"
              className="border-0"
              title="Weekly Schedule"
              allow="fullscreen"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info Section */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-orange-700 flex items-center">
            <span className="mr-2">📧</span>
            {contact?.title || defaultContact.title}
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
                <a
                  href="mailto:garimella@hsamckinley.org"
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  garimella@hsamckinley.org
                </a>
              </p>
            </div>

            {/* Office Hours Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
              <h3 className="font-semibold text-green-700 mb-2 flex items-center">
                <span className="mr-2">🕐</span>
                Office Hours
              </h3>
              <p className="text-gray-700">
                I am free during the school day from <strong>6th period to 8th period</strong>
              </p>
              <p className="text-sm text-gray-600 mt-1">Find me in room 230!</p>
            </div>

            {/* Tutoring Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
              <h3 className="font-semibold text-purple-700 mb-2 flex items-center">
                <span className="mr-2">📚</span>
                Tutoring
              </h3>
              <p className="text-gray-700">
                <strong>Tuesday's and Thursday's</strong>
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
                <strong>Monday's afterschool</strong>
              </p>
              <p className="text-sm text-gray-600 mt-1">OR schedule a time :)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
