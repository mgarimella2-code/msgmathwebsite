import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Testing Neon database connection...")

    // Prioritize DATABASE_URL and POSTGRES_URL (Neon) over Supabase variables
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    console.log("Environment check:")
    console.log("- DATABASE_URL exists:", !!process.env.DATABASE_URL)
    console.log("- POSTGRES_URL exists:", !!process.env.POSTGRES_URL)
    console.log("- Using URL:", dbUrl ? dbUrl.substring(0, 30) + "..." : "none")

    if (!dbUrl) {
      return NextResponse.json({
        success: false,
        error: "No Neon database URL found",
        details: "Neither DATABASE_URL nor POSTGRES_URL environment variables are set for Neon",
        suggestion: "Add Neon integration in Vercel dashboard or set DATABASE_URL manually",
      })
    }

    console.log("Trying Neon database connection...")
    try {
      const { sql } = await import("@vercel/postgres")
      const result = await sql`SELECT 1 as test, NOW() as current_time, version() as db_version`

      return NextResponse.json({
        success: true,
        method: "neon-postgres",
        result: result.rows[0],
        message: "Neon database connection successful!",
      })
    } catch (pgError) {
      console.error("Neon database connection error:", pgError)

      return NextResponse.json({
        success: false,
        error: "Neon database connection failed",
        details: pgError instanceof Error ? pgError.message : "Unknown error",
        suggestion: "Check if your Neon database is running and the connection string is correct",
      })
    }
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
