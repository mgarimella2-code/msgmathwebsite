import { siteContent } from "@/lib/content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ExternalLink, FileText, BookOpen, PenTool, LinkIcon } from "lucide-react"
import { notFound } from "next/navigation"

const sectionConfig = {
  info: { title: "Important Class Information", icon: FileText, color: "text-blue-600" },
  notes: { title: "Notes", icon: BookOpen, color: "text-green-600" },
  study_guides: { title: "Study Guide Answer Keys", icon: PenTool, color: "text-purple-600" },
  classwork: { title: "Classwork Information", icon: FileText, color: "text-orange-600" },
  misc: { title: "Miscellaneous Links", icon: LinkIcon, color: "text-red-600" },
}

export default function ClassPage({ params }: { params: { slug: string } }) {
  const classData = siteContent.classes[params.slug as keyof typeof siteContent.classes]

  if (!classData) {
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-purple-700 mb-2">{classData.name}</h1>
        <p className="text-gray-600">Find all resources and information for this class below.</p>
      </div>

      <div className="space-y-6">
        {Object.entries(sectionConfig).map(([sectionType, config]) => {
          const sectionContent = classData.sections[sectionType as keyof typeof classData.sections] || []
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
                    {sectionContent.map((item) => (
                      <div key={item.id} className="p-4 bg-white rounded-lg shadow-sm border">
                        {item.title && <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>}
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
                    No content available for this section yet. Content can be added by editing the content file.
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
