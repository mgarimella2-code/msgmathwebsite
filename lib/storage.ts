const API_BASE = "/api/content"

export async function saveContentToStorage(content: any) {
  try {
    console.log("💾 Saving content to storage...")

    // Save to localStorage immediately for instant feedback
    if (typeof window !== "undefined") {
      localStorage.setItem("ms-g-website-content", JSON.stringify(content))
    }

    // Try database via API route (this will work since API routes have env vars)
    try {
      console.log("💾 Trying database via API...")
      const response = await fetch("/api/save-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(content),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log("✅ SUCCESS: Content saved to database (permanent)")

          // Clear localStorage on other devices by setting a sync flag
          if (typeof window !== "undefined") {
            localStorage.setItem("ms-g-last-save", Date.now().toString())
          }

          return { success: true, source: "database", permanent: true }
        } else {
          console.log("❌ Database save failed via API:", result.error)
        }
      } else {
        console.log("❌ Database API request failed:", response.status)
      }
    } catch (dbError) {
      console.log("❌ Database API error:", dbError)
    }

    // Fallback to server API (24-hour storage)
    try {
      console.log("💾 Trying server API fallback...")
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      })

      if (response.ok) {
        console.log("✅ SUCCESS: Content saved to server (24-hour limit)")
        return { success: true, source: "server", permanent: false }
      } else {
        console.log("❌ Server save failed, using localStorage only")
      }
    } catch (serverError) {
      console.warn("❌ Server save failed:", serverError)
    }

    // At minimum, localStorage worked (if we're in browser)
    if (typeof window !== "undefined") {
      console.log("✅ SUCCESS: Content saved to localStorage only")
      return { success: true, source: "localStorage", permanent: false }
    }

    return { success: false, error: "No storage method available" }
  } catch (error) {
    console.error("💥 Error saving content:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function loadContentFromStorage() {
  try {
    console.log("🔍 Loading content from storage...")

    // Try database via API route first with cache busting
    try {
      console.log("📖 Trying database via API...")
      const response = await fetch(`/api/load-content?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.content) {
          console.log("✅ SUCCESS: Loaded content from database (permanent)")
          console.log("📊 Content loaded at:", result.content._loadedAt)

          // Update localStorage with database content
          if (typeof window !== "undefined") {
            localStorage.setItem("ms-g-website-content", JSON.stringify(result.content))
            localStorage.setItem("ms-g-last-load", Date.now().toString())
          }
          return { success: true, content: result.content, source: "database" }
        } else {
          console.log("❌ Database load failed via API:", result.error)
        }
      } else {
        console.log("❌ Database API request failed:", response.status)
      }
    } catch (dbError) {
      console.log("❌ Database API error:", dbError)
    }

    // Fallback to server API
    try {
      console.log("📖 Trying server API...")
      const response = await fetch(`${API_BASE}?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })

      if (response.ok) {
        const serverContent = await response.json()
        console.log("✅ SUCCESS: Loaded content from server (24-hour limit)")
        if (typeof window !== "undefined") {
          localStorage.setItem("ms-g-website-content", JSON.stringify(serverContent))
        }
        return { success: true, content: serverContent, source: "server" }
      } else {
        console.log("❌ Server load failed, trying localStorage")
      }
    } catch (serverError) {
      console.warn("❌ Server load failed:", serverError)
    }

    // Final fallback to localStorage
    if (typeof window !== "undefined") {
      const localContent = localStorage.getItem("ms-g-website-content")
      if (localContent) {
        const parsedContent = JSON.parse(localContent)
        console.log("✅ SUCCESS: Loaded content from localStorage (browser only)")
        console.log("⚠️ WARNING: This device is not syncing with database!")
        return { success: true, content: parsedContent, source: "localStorage" }
      }
    }

    throw new Error("No content available from any source")
  } catch (error) {
    console.error("💥 Error loading content:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function checkForUpdates(lastUpdateTime?: string) {
  try {
    // Check database via API first with cache busting
    try {
      console.log("🔄 Checking database for updates via API...")
      const response = await fetch(`/api/check-updates?lastUpdate=${lastUpdateTime || ""}&t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("🔄 Database update check result:", { hasUpdates: data.hasUpdates })
        if (data.hasUpdates) {
          return data
        }
      }
    } catch (dbError) {
      console.log("❌ Database update check failed, trying server:", dbError)
    }

    // Fallback to server check
    try {
      console.log("🔄 Checking server for updates...")
      const response = await fetch(`${API_BASE}?lastUpdate=${lastUpdateTime || ""}&t=${Date.now()}`, {
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("🔄 Server update check result:", { hasUpdates: data.hasUpdates })
        return { hasUpdates: data.hasUpdates, content: data.content }
      }
    } catch (serverError) {
      console.warn("❌ Server update check failed:", serverError)
    }

    return { hasUpdates: false }
  } catch (error) {
    console.warn("❌ Failed to check for updates:", error)
    return { hasUpdates: false }
  }
}
