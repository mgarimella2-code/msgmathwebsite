import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 DEBUG: Checking what's actually in the database...")

    // Check for any available database environment variables
    const neonUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING

    if (!neonUrl) {
      return NextResponse.json({
        success: false,
        error: "No database URL found",
        debug: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          POSTGRES_URL: !!process.env.POSTGRES_URL,
          POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
          POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
        },
      })
    }

    let result
    try {
      // Try Neon serverless first
      const { neon } = await import("@neondatabase/serverless")
      const sql = neon(neonUrl)

      // Check if table exists
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'website_content'
        ) as table_exists
      `

      // Get all content from database
      const contentResult = await sql`
        SELECT id, content, updated_at, 
               LENGTH(content::text) as content_size
        FROM website_content 
        ORDER BY updated_at DESC
      `

      // Get row count - FIX THE BUG HERE
      const countResult = await sql`
        SELECT COUNT(*) as total_rows FROM website_content
      `

      // Get the actual content to see what's there
      const actualContent = contentResult.length > 0 ? contentResult[0].content : null

      return NextResponse.json({
        success: true,
        method: "neon-serverless",
        debug: {
          tableExists: tableCheck[0].table_exists,
          totalRows: Number.parseInt(countResult[0].count) || contentResult.length, // Fix: use count properly
          contentSize: contentResult[0]?.content_size || 0,
          lastUpdate: contentResult[0]?.updated_at || null,
          hasContent: contentResult.length > 0,
          contentPreview: actualContent ? Object.keys(actualContent) : [],
          actualRowCount: contentResult.length, // Add this for comparison
        },
        rawData: contentResult.map((row) => ({
          id: row.id,
          updated_at: row.updated_at,
          content_size: row.content_size,
          content_keys: row.content ? Object.keys(row.content) : [],
        })),
        // Add the actual content so we can see what's stored
        actualContent: actualContent,
      })
    } catch (neonError) {
      console.log("Neon failed, trying Vercel Postgres:", neonError)

      // Fallback to Vercel Postgres
      const { sql } = await import("@vercel/postgres")

      // Check if table exists
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'website_content'
        ) as table_exists
      `

      // Get all content from database
      const contentResult = await sql`
        SELECT id, content, updated_at, 
               LENGTH(content::text) as content_size
        FROM website_content 
        ORDER BY updated_at DESC
      `

      // Get row count
      const countResult = await sql`
        SELECT COUNT(*) as total_rows FROM website_content
      `

      // Get the actual content to see what's there
      const actualContent = contentResult.rows.length > 0 ? contentResult.rows[0].content : null

      return NextResponse.json({
        success: true,
        method: "vercel-postgres",
        debug: {
          tableExists: tableCheck.rows[0].table_exists,
          totalRows: Number.parseInt(countResult.rows[0].total_rows) || contentResult.rows.length,
          contentSize: contentResult.rows[0]?.content_size || 0,
          lastUpdate: contentResult.rows[0]?.updated_at || null,
          hasContent: contentResult.rows.length > 0,
          contentPreview: actualContent ? Object.keys(actualContent) : [],
          actualRowCount: contentResult.rows.length,
        },
        rawData: contentResult.rows.map((row) => ({
          id: row.id,
          updated_at: row.updated_at,
          content_size: row.content_size,
          content_keys: row.content ? Object.keys(row.content) : [],
        })),
        actualContent: actualContent,
      })
    }
  } catch (error) {
    console.error("Database debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Failed to debug database contents",
      },
      { status: 500 },
    )
  }
}
