import { NextResponse } from "next/server"
import { loadContentFromDatabase } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔗 API: Loading content from database...")

    const result = await loadContentFromDatabase()

    if (result.success && result.content) {
      console.log("✅ API: Database load successful")
      return NextResponse.json({
        success: true,
        content: result.content,
      })
    } else {
      console.log("❌ API: Database load failed:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("💥 API: Load content error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
