import { type NextRequest, NextResponse } from "next/server"
import { checkDatabaseForUpdates } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lastUpdate = searchParams.get("lastUpdate")

    console.log("🔗 API: Checking database for updates...")

    const result = await checkDatabaseForUpdates(lastUpdate || undefined)

    console.log("✅ API: Update check result:", { hasUpdates: result.hasUpdates })

    return NextResponse.json({
      hasUpdates: result.hasUpdates,
      content: result.content || null,
    })
  } catch (error) {
    console.error("💥 API: Check updates error:", error)
    return NextResponse.json({
      hasUpdates: false,
      content: null,
    })
  }
}
