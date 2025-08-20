import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Testing database connection...")

    // Check for any available Neon environment variables
    const neonUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING

    console.log("Environment check:")
    console.log("- DATABASE_URL exists:", !!process.env.DATABASE_URL)
    console.log("- POSTGRES_URL exists:", !!process.env.POSTGRES_URL)
    console.log("- POSTGRES_PRISMA_URL exists:", !!process.env.POSTGRES_PRISMA_URL)
    console.log("- POSTGRES_URL_NON_POOLING exists:", !!process.env.POSTGRES_URL_NON_POOLING)
    console.log("- Using URL:", neonUrl ? neonUrl.substring(0, 30) + "..." : "none")

    if (!neonUrl) {
      return NextResponse.json({
        success: false,
        error: "No database URL found",
        details:
          "None of the expected database environment variables (DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING) are set",
        suggestion: "Add Neon integration in Vercel dashboard or set DATABASE_URL manually",
      })
    }

    console.log("Trying database connection...")
    try {
      // Try Neon serverless first
      try {
        const { neon } = await import("@neondatabase/serverless")
        const sql = neon(neonUrl)
        const result = await sql`SELECT 1 as test, NOW() as current_time, version() as db_version`

        return NextResponse.json({
          success: true,
          method: "neon-serverless",
          result: result[0],
          message: "Neon serverless connection successful!",
        })
      } catch (neonError) {
        console.log("Neon serverless failed, trying Vercel Postgres:", neonError)

        // Fallback to Vercel Postgres
        const { sql } = await import("@vercel/postgres")
        const result = await sql`SELECT 1 as test, NOW() as current_time, version() as db_version`

        return NextResponse.json({
          success: true,
          method: "vercel-postgres",
          result: result.rows[0],
          message: "Vercel Postgres connection successful!",
        })
      }
    } catch (pgError) {
      console.error("Database connection error:", pgError)

      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: pgError instanceof Error ? pgError.message : "Unknown error",
        suggestion: "Check if your database is running and the connection string is correct",
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
