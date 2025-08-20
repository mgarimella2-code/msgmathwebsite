import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Testing Neon database connection...")

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
        error: "No Neon database URL found",
        details:
          "None of the expected Neon environment variables (DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING) are set",
        suggestion: "Add Neon integration in Vercel dashboard or set DATABASE_URL manually",
      })
    }

    console.log("Trying Neon database connection with explicit connection string...")
    try {
      const { sql } = await import("@vercel/postgres")

      // Use explicit connection string
      const dbSql = sql.withConnectionString(neonUrl)
      const result = await dbSql`SELECT 1 as test, NOW() as current_time, version() as db_version`

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
