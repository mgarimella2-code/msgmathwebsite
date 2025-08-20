// Database connection with proper Neon setup - FIXED VERSION
let hasDatabase = false

// Check if database is available
async function checkDatabaseAvailability() {
  try {
    // Check for Neon environment variables first
    const neonUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING

    if (!neonUrl) {
      console.log("No Neon database URL found - checking available env vars...")
      console.log("Available DB env vars:", {
        DATABASE_URL: !!process.env.DATABASE_URL,
        POSTGRES_URL: !!process.env.POSTGRES_URL,
        POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
        POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
      })
      return false
    }

    console.log("Using database URL:", neonUrl.substring(0, 20) + "...")

    // Try using Neon's serverless driver
    try {
      const { neon } = await import("@neondatabase/serverless")
      const sql = neon(neonUrl)
      await sql`SELECT 1 as test`
      console.log("Neon serverless connection successful")
      return true
    } catch (neonError) {
      console.log("Neon serverless failed, trying Vercel Postgres:", neonError)

      // Fallback to Vercel Postgres
      const { sql } = await import("@vercel/postgres")
      await sql`SELECT 1 as test`
      console.log("Vercel Postgres connection successful")
      return true
    }
  } catch (error) {
    console.log("Database not available:", error instanceof Error ? error.message : "Unknown error")
    return false
  }
}

export async function saveContentToDatabase(content: any) {
  try {
    if (!hasDatabase) {
      hasDatabase = await checkDatabaseAvailability()
      if (!hasDatabase) {
        return { success: false, error: "Database not configured" }
      }
    }

    console.log("💾 Saving content to database...")
    console.log("💾 Content keys:", Object.keys(content))

    // Get the connection string
    const neonUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING

    if (!neonUrl) {
      return { success: false, error: "No database connection string found" }
    }

    let result
    try {
      // Try Neon serverless first
      const { neon } = await import("@neondatabase/serverless")
      const sql = neon(neonUrl)

      // FIXED: Use proper UPSERT syntax
      result = await sql`
        INSERT INTO website_content (id, content, updated_at)
        VALUES (1, ${JSON.stringify(content)}, NOW())
        ON CONFLICT (id) 
        DO UPDATE SET 
          content = EXCLUDED.content,
          updated_at = EXCLUDED.updated_at
        RETURNING updated_at, id
      `

      console.log("✅ Neon save result:", result)
    } catch (neonError) {
      console.log("❌ Neon save failed, trying Vercel Postgres:", neonError)

      // Fallback to Vercel Postgres
      const { sql } = await import("@vercel/postgres")
      result = await sql`
        INSERT INTO website_content (id, content, updated_at)
        VALUES (1, ${JSON.stringify(content)}, NOW())
        ON CONFLICT (id) 
        DO UPDATE SET 
          content = EXCLUDED.content,
          updated_at = EXCLUDED.updated_at
        RETURNING updated_at, id
      `

      console.log("✅ Vercel Postgres save result:", result.rows)
    }

    console.log("✅ Content saved to database successfully")
    return {
      success: true,
      timestamp: result[0]?.updated_at || result.rows?.[0]?.updated_at || new Date().toISOString(),
    }
  } catch (error) {
    console.error("💥 Database save error:", error)
    hasDatabase = false // Reset flag on error
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function loadContentFromDatabase() {
  try {
    if (!hasDatabase) {
      hasDatabase = await checkDatabaseAvailability()
      if (!hasDatabase) {
        return { success: false, error: "Database not configured" }
      }
    }

    console.log("📖 Loading content from database...")

    // Get the connection string
    const neonUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING

    if (!neonUrl) {
      return { success: false, error: "No database connection string found" }
    }

    let result
    try {
      // Try Neon serverless first
      const { neon } = await import("@neondatabase/serverless")
      const sql = neon(neonUrl)

      result = await sql`
        SELECT content, updated_at 
        FROM website_content 
        WHERE id = 1
        ORDER BY updated_at DESC
        LIMIT 1
      `

      console.log("📖 Neon load result:", result.length, "rows")
    } catch (neonError) {
      console.log("❌ Neon load failed, trying Vercel Postgres:", neonError)

      // Fallback to Vercel Postgres
      const { sql } = await import("@vercel/postgres")
      result = await sql`
        SELECT content, updated_at 
        FROM website_content 
        WHERE id = 1
        ORDER BY updated_at DESC
        LIMIT 1
      `

      console.log("📖 Vercel Postgres load result:", result.rows.length, "rows")
      result = result.rows // Normalize for Vercel Postgres
    }

    if (result.length > 0) {
      const row = result[0]
      console.log("✅ Content loaded from database successfully")
      console.log("✅ Content keys:", Object.keys(row.content))
      return {
        success: true,
        content: {
          ...row.content,
          _lastUpdate: row.updated_at,
        },
      }
    } else {
      console.log("❌ No content found in database")
      return { success: false, error: "No content found" }
    }
  } catch (error) {
    console.error("💥 Database load error:", error)
    hasDatabase = false // Reset flag on error
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function checkDatabaseForUpdates(lastUpdateTime?: string) {
  try {
    if (!hasDatabase) {
      hasDatabase = await checkDatabaseAvailability()
      if (!hasDatabase) {
        return { hasUpdates: false }
      }
    }

    if (!lastUpdateTime) return { hasUpdates: true }

    // Get the connection string
    const neonUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING

    if (!neonUrl) {
      return { hasUpdates: false }
    }

    let result
    try {
      // Try Neon serverless first
      const { neon } = await import("@neondatabase/serverless")
      const sql = neon(neonUrl)

      result = await sql`
        SELECT updated_at, content
        FROM website_content 
        WHERE id = 1 AND updated_at > ${lastUpdateTime}
        ORDER BY updated_at DESC
        LIMIT 1
      `
    } catch (neonError) {
      console.log("Neon update check failed, trying Vercel Postgres:", neonError)

      // Fallback to Vercel Postgres
      const { sql } = await import("@vercel/postgres")
      result = await sql`
        SELECT updated_at, content
        FROM website_content 
        WHERE id = 1 AND updated_at > ${lastUpdateTime}
        ORDER BY updated_at DESC
        LIMIT 1
      `
      result = result.rows // Normalize for Vercel Postgres
    }

    if (result.length > 0) {
      const row = result[0]
      return {
        hasUpdates: true,
        content: {
          ...row.content,
          _lastUpdate: row.updated_at,
        },
      }
    }

    return { hasUpdates: false }
  } catch (error) {
    console.error("Database update check error:", error)
    hasDatabase = false // Reset flag on error
    return { hasUpdates: false }
  }
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    const isAvailable = await checkDatabaseAvailability()
    if (isAvailable) {
      hasDatabase = true
      return { success: true, message: "Database connection successful" }
    } else {
      return { success: false, error: "Database not configured or unavailable" }
    }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
