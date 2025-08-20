import { NextResponse } from "next/server"
import { loadContentFromDatabase } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔗 API: Loading content from database...")

    const result = await loadContentFromDatabase()

    if (result.success && result.content) {
      console.log("✅ API: Database load successful")

      // Add timestamp to force cache invalidation
      const contentWithTimestamp = {
        ...result.content,
        _loadedAt: new Date().toISOString(),
        _cacheBreaker: Date.now(),
      }

      return NextResponse.json(
        {
          success: true,
          content: contentWithTimestamp,
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      )
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
