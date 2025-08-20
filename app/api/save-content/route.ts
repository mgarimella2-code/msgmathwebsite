import { type NextRequest, NextResponse } from "next/server"
import { saveContentToDatabase } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const content = await request.json()
    console.log("🔗 API: Saving content to database...")

    const result = await saveContentToDatabase(content)

    if (result.success) {
      console.log("✅ API: Database save successful")
      return NextResponse.json({
        success: true,
        message: "Content saved to database",
        timestamp: result.timestamp,
        method: result.method,
        size: result.size,
      })
    } else {
      console.log("❌ API: Database save failed:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          details: result.details,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("💥 API: Save content error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
