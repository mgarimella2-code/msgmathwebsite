import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Testing database connection...")

    // Check environment variables
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    console.log("Environment check:")
    console.log("- POSTGRES_URL exists:", !!process.env.POSTGRES_URL)
    console.log("- DATABASE_URL exists:", !!process.env.DATABASE_URL)
    console.log("- SUPABASE_URL exists:", !!supabaseUrl)

    if (!dbUrl && !supabaseUrl) {
      return NextResponse.json({
        success: false,
        error: "No database URL found",
        details: "Neither POSTGRES_URL nor DATABASE_URL environment variables are set",
      })
    }

    // Try different connection methods
    if (dbUrl) {
      console.log("Trying Vercel Postgres connection...")
      try {
        const { sql } = await import("@vercel/postgres")
        const result = await sql`SELECT 1 as test, NOW() as current_time`

        return NextResponse.json({
          success: true,
          method: "vercel-postgres",
          result: result.rows[0],
          message: "Database connection successful!",
        })
      } catch (pgError) {
        console.error("Vercel Postgres error:", pgError)

        return NextResponse.json({
          success: false,
          error: "Vercel Postgres connection failed",
          details: pgError instanceof Error ? pgError.message : "Unknown error",
          suggestion: "Check if your database is running and accessible",
        })
      }
    }

    if (supabaseUrl) {
      console.log("Trying Supabase connection...")
      try {
        const { createClient } = await import("@supabase/supabase-js")
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

        const { data, error } = await supabase.from("website_content").select("count").limit(1)

        if (error && !error.message.includes('relation "website_content" does not exist')) {
          throw error
        }

        return NextResponse.json({
          success: true,
          method: "supabase",
          message: "Supabase connection successful!",
        })
      } catch (supabaseError) {
        console.error("Supabase error:", supabaseError)

        return NextResponse.json({
          success: false,
          error: "Supabase connection failed",
          details: supabaseError instanceof Error ? supabaseError.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: false,
      error: "No valid database configuration found",
    })
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
