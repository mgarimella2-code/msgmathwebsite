// Enhanced storage system with graceful database fallback
import { saveContentToDatabase, loadContentFromDatabase, checkDatabaseForUpdates } from "./database"

const API_BASE = "/api/content"

export async function saveContentToStorage(content: any) {
  try {
    console.log("Saving content to storage...")

    // Save to localStorage immediately for instant feedback
    if (typeof window !== "undefined") {
      localStorage.setItem("ms-g-website-content", JSON.stringify(content))
    }

    // Try database first (permanent storage) - but don't fail if unavailable
    try {
      const dbResult = await saveContentToDatabase(content)
      if (dbResult.success) {
        console.log("Content saved to database (permanent)")
        return { success: true, source: "database", permanent: true }
      } else {
        console.log("Database save failed, trying server fallback:", dbResult.error)
      }
    } catch (dbError) {
      console.log("Database save error, trying server fallback:", dbError)
    }

    // Fallback to server API (24-hour storage)
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      })

      if (response.ok) {
        console.log("Content saved to server (24-hour limit)")
        return { success: true, source: "server", permanent: false }
      } else {
        console.log("Server save failed, using localStorage only")
      }
    } catch (serverError) {
      console.warn("Server save failed:", serverError)
    }

    // At minimum, localStorage worked (if we're in browser)
    if (typeof window !== "undefined") {
      console.log("Content saved to localStorage only")
      return { success: true, source: "localStorage", permanent: false }
    }

    return { success: false, error: "No storage method available" }
  } catch (error) {
    console.error("Error saving content:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function loadContentFromStorage() {
  try {
    console.log("Loading content from storage...")

    // Try database first (most reliable) - but don't fail if unavailable
    try {
      const dbResult = await loadContentFromDatabase()
      if (dbResult.success && dbResult.content) {
        console.log("Loaded content from database (permanent)")
        // Update localStorage with database content
        if (typeof window !== "undefined") {
          localStorage.setItem("ms-g-website-content", JSON.stringify(dbResult.content))
        }
        return { success: true, content: dbResult.content, source: "database" }
      } else {
        console.log("Database load failed, trying server fallback:", dbResult.error)
      }
    } catch (dbError) {
      console.log("Database load error, trying server fallback:", dbError)
    }

    // Fallback to server API
    try {
      const response = await fetch(API_BASE, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })

      if (response.ok) {
        const serverContent = await response.json()
        console.log("Loaded content from server")
        if (typeof window !== "undefined") {
          localStorage.setItem("ms-g-website-content", JSON.stringify(serverContent))
        }
        return { success: true, content: serverContent, source: "server" }
      } else {
        console.log("Server load failed, trying localStorage")
      }
    } catch (serverError) {
      console.warn("Server load failed:", serverError)
    }

    // Final fallback to localStorage
    if (typeof window !== "undefined") {
      const localContent = localStorage.getItem("ms-g-website-content")
      if (localContent) {
        const parsedContent = JSON.parse(localContent)
        console.log("Loaded content from localStorage")
        return { success: true, content: parsedContent, source: "localStorage" }
      }
    }

    throw new Error("No content available from any source")
  } catch (error) {
    console.error("Error loading content:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function checkForUpdates(lastUpdateTime?: string) {
  try {
    // Check database first - but don't fail if unavailable
    try {
      const dbResult = await checkDatabaseForUpdates(lastUpdateTime)
      if (dbResult.hasUpdates) {
        return dbResult
      }
    } catch (dbError) {
      console.log("Database update check failed, trying server:", dbError)
    }

    // Fallback to server check
    try {
      const response = await fetch(`${API_BASE}?lastUpdate=${lastUpdateTime || ""}`, {
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        return { hasUpdates: data.hasUpdates, content: data.content }
      }
    } catch (serverError) {
      console.warn("Server update check failed:", serverError)
    }

    return { hasUpdates: false }
  } catch (error) {
    console.warn("Failed to check for updates:", error)
    return { hasUpdates: false }
  }
}
