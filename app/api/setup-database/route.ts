import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("Setting up database table...")

    // Check for any available database environment variables
    const neonUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING

    if (!neonUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured",
          details: "No database URL found in environment variables. Database features are not available.",
        },
        { status: 400 },
      )
    }

    let sql: any
    let isNeonServerless = false

    try {
      // Try Neon serverless first
      const { neon } = await import("@neondatabase/serverless")
      sql = neon(neonUrl)
      isNeonServerless = true
      console.log("Using Neon serverless driver")
    } catch (neonError) {
      console.log("Neon serverless not available, using Vercel Postgres:", neonError)

      // Fallback to Vercel Postgres
      const { sql: vercelSql } = await import("@vercel/postgres")
      sql = vercelSql
      isNeonServerless = false
      console.log("Using Vercel Postgres driver")
    }

    // Test connection first
    await sql`SELECT 1 as test`

    // Create the content table
    await sql`
      CREATE TABLE IF NOT EXISTS website_content (
        id INTEGER PRIMARY KEY DEFAULT 1,
        content JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Check if we have any content
    const existingContent = await sql`
      SELECT COUNT(*) as count FROM website_content WHERE id = 1
    `

    const count = isNeonServerless ? existingContent[0].count : existingContent.rows[0].count

    // Insert default content if table is empty
    if (count === 0 || count === "0") {
      const defaultContent = {
        welcome: {
          title: "Welcome",
          content:
            "Hi all! This is Ms. G's website :) You can find all the information for class you need here and a weekly schedule! But if you have a question remember you can always find me in room 230!",
        },
        contact: {
          title: "Ms. G's Contact Info :)",
          email: "garimella@hsamckinley.org",
          officeHours: "I am free during the school day from 6th period to 8th period",
          tutoring: "Tuesday's and Thursday's",
          makeupTests: "Monday's afterschool OR schedule a time :)",
        },
        importantLinks: [
          { id: 1, title: "Math 1 HW and Textbook", url: "https://my.mheducation.com/login" },
          { id: 2, title: "AP PreCalc Flipped Math", url: "https://precalculus.flippedmath.com/ap-precalc.html" },
          { id: 3, title: "AP Classroom", url: "https://myap.collegeboard.org/login" },
          { id: 4, title: "Graphing Calculator", url: "https://desmos.com" },
          { id: 5, title: "Powerschool", url: "https://concept-il.powerschool.com/teachers/home.html" },
        ],
        classes: {
          "ap-precalc": {
            name: "AP PreCalc",
            sections: { info: [], notes: [], study_guides: [], classwork: [], misc: [] },
          },
          "math-1-period-1": {
            name: "Math 1: Period 1",
            sections: { info: [], notes: [], study_guides: [], classwork: [], misc: [] },
          },
          "math-1-honors": {
            name: "Math 1 Honors",
            sections: { info: [], notes: [], study_guides: [], classwork: [], misc: [] },
          },
          "math-1-period-4": {
            name: "Math 1: Period 4",
            sections: { info: [], notes: [], study_guides: [], classwork: [], misc: [] },
          },
          "math-1-period-5": {
            name: "Math 1: Period 5",
            sections: { info: [], notes: [], study_guides: [], classwork: [], misc: [] },
          },
        },
        announcements: [
          {
            id: 1,
            title: "Welcome to the New School Year!",
            content: "Welcome back students! I'm excited for another great year of math.",
            date: "2024-08-15",
          },
        ],
      }

      await sql`
        INSERT INTO website_content (id, content, updated_at)
        VALUES (1, ${JSON.stringify(defaultContent)}, NOW())
      `

      console.log("Default content inserted")
    }

    console.log("Database setup completed successfully")

    return NextResponse.json({
      success: true,
      message: "Database table created and initialized successfully! Permanent storage is now active.",
    })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Failed to set up database table. This might be because database is not configured or available.",
      },
      { status: 500 },
    )
  }
}
