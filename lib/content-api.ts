"use server"

import { writeFile, readFile } from "fs/promises"
import { join } from "path"
import { siteContent as defaultContent } from "./content"

const CONTENT_FILE = join(process.cwd(), "data", "site-content.json")

// Ensure data directory exists
async function ensureDataDir() {
  try {
    const { mkdir } = await import("fs/promises")
    await mkdir(join(process.cwd(), "data"), { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

export async function getStoredContent() {
  try {
    await ensureDataDir()
    const fileContent = await readFile(CONTENT_FILE, "utf-8")
    return JSON.parse(fileContent)
  } catch (error) {
    // If file doesn't exist, return default content
    return defaultContent
  }
}

export async function saveContent(content: typeof defaultContent) {
  try {
    await ensureDataDir()
    await writeFile(CONTENT_FILE, JSON.stringify(content, null, 2))
    return { success: true }
  } catch (error) {
    console.error("Failed to save content:", error)
    return { success: false, error: "Failed to save content" }
  }
}

export async function updateWelcomeContent(title: string, content: string) {
  const currentContent = await getStoredContent()
  const updatedContent = {
    ...currentContent,
    welcome: { title, content },
  }
  return await saveContent(updatedContent)
}

export async function updateContactContent(contactData: any) {
  const currentContent = await getStoredContent()
  const updatedContent = {
    ...currentContent,
    contact: { ...currentContent.contact, ...contactData },
  }
  return await saveContent(updatedContent)
}

export async function updateImportantLinks(links: any[]) {
  const currentContent = await getStoredContent()
  const updatedContent = {
    ...currentContent,
    importantLinks: links,
  }
  return await saveContent(updatedContent)
}

export async function updateAnnouncements(announcements: any[]) {
  const currentContent = await getStoredContent()
  const updatedContent = {
    ...currentContent,
    announcements,
  }
  return await saveContent(updatedContent)
}
