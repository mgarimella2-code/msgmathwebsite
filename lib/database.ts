// Database connection with proper error handling - prioritizes Neon over Supabase
let hasDatabase = false

// Check if database is available
async function checkDatabaseAvailability() {
  try {
    // Prioritize DATABASE_URL and POSTGRES_URL (Neon) over Supabase
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!dbUrl) {
      console.log("No Neon database URL found - database features disabled")
      return false
    }

    console.log("Using database URL:", dbUrl.substring(0, 20) + "...")

    // Try to import and use the database
    const { sql } = await import("@vercel/postgres")
    await sql`SELECT 1 as test`
    console.log("Neon database connection successful")
    return true
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
        return { success: false, error: "Neon database not configured" }
      }
    }

    console.log("Saving content to Neon database...")
    const { sql } = await import("@vercel/postgres")

    const result = await sql`
      INSERT INTO website_content (id, content, updated_at)
      VALUES (1, ${JSON.stringify(content)}, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        content = ${JSON.stringify(content)},
        updated_at = NOW()
      RETURNING updated_at
    `

    console.log("Content saved to Neon database successfully")
    return {
      success: true,
      timestamp: result.rows[0]?.updated_at || new Date().toISOString(),
    }
  } catch (error) {
    console.error("Neon database save error:", error)
    hasDatabase = false // Reset flag on error
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function loadContentFromDatabase() {
  try {
    if (!hasDatabase) {
      hasDatabase = await checkDatabaseAvailability()
      if (!hasDatabase) {
        return { success: false, error: "Neon database not configured" }
      }
    }

    console.log("Loading content from Neon database...")
    const { sql } = await import("@vercel/postgres")

    const result = await sql`
      SELECT content, updated_at 
      FROM website_content 
      WHERE id = 1
    `

    if (result.rows.length > 0) {
      const row = result.rows[0]
      console.log("Content loaded from Neon database successfully")
      return {
        success: true,
        content: {
          ...row.content,
          _lastUpdate: row.updated_at,
        },
      }
    } else {
      console.log("No content found in Neon database")
      return { success: false, error: "No content found" }
    }
  } catch (error) {
    console.error("Neon database load error:", error)
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

    const { sql } = await import("@vercel/postgres")
    const result = await sql`
      SELECT updated_at, content
      FROM website_content 
      WHERE id = 1 AND updated_at > ${lastUpdateTime}
    `

    if (result.rows.length > 0) {
      const row = result.rows[0]
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
    console.error("Neon database update check error:", error)
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
      return { success: true, message: "Neon database connection successful" }
    } else {
      return { success: false, error: "Neon database not configured or unavailable" }
    }
  } catch (error) {
    console.error("Neon database connection test failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
