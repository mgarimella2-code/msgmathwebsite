// Database connection with proper error handling
let hasDatabase = false

// Check if database is available
async function checkDatabaseAvailability() {
  try {
    // Check if we have the required environment variables
    if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
      console.log("No database URL found - database features disabled")
      return false
    }

    // Try to import and use the database
    const { sql } = await import("@vercel/postgres")
    await sql`SELECT 1 as test`
    console.log("Database connection successful")
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
        return { success: false, error: "Database not configured" }
      }
    }

    console.log("Saving content to database...")
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

    console.log("Content saved to database successfully")
    return {
      success: true,
      timestamp: result.rows[0]?.updated_at || new Date().toISOString(),
    }
  } catch (error) {
    console.error("Database save error:", error)
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

    console.log("Loading content from database...")
    const { sql } = await import("@vercel/postgres")

    const result = await sql`
      SELECT content, updated_at 
      FROM website_content 
      WHERE id = 1
    `

    if (result.rows.length > 0) {
      const row = result.rows[0]
      console.log("Content loaded from database successfully")
      return {
        success: true,
        content: {
          ...row.content,
          _lastUpdate: row.updated_at,
        },
      }
    } else {
      console.log("No content found in database")
      return { success: false, error: "No content found" }
    }
  } catch (error) {
    console.error("Database load error:", error)
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
