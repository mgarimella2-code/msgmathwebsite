"use client"

import { siteContent as initialContent } from "./content"

// Use a simple URL-based storage system that works across devices
const STORAGE_URL = "https://api.jsonbin.io/v3/b" // Free JSON storage service

// Simple in-memory store for content updates
let contentStore = { ...initialContent }

export function getContent() {
  return contentStore
}

// For now, let's use a hybrid approach - save to both localStorage and update the static content
export function updateContent(newContent: typeof initialContent) {
  contentStore = { ...newContent }
  
  // Save to localStorage as backup
  if (typeof window !== "undefined") {
    localStorage.setItem("ms-g-content", JSON.stringify(newContent))
    
    // Also save to a simple cloud storage (you can replace this with your preferred method)
    try {
      // This is a placeholder - in a real deployment you'd use a proper database
      console.log("Content updated:", newContent)
    } catch (error) {
      console.warn("Failed to sync to cloud:", error)
    }
  }
}

export function loadContentFromStorage() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("ms-g-content")
    if (saved) {
      try {
        const parsedContent = JSON.parse(saved)
        contentStore = parsedContent
        return parsedContent
      } catch (error) {
        console.warn("Failed to load saved content:", error)
      }
    }
  }
  return contentStore
}

export function addClassContentItem(className: string, sectionType: string, item: any) {
  const currentContent = getContent()
  
  // Ensure the class exists
  if (!currentContent.classes[className]) {
    return { success: false, error: "Class not found" }
  }
  
  // Ensure the sections object exists
  if (!currentContent.classes[className].sections) {
    currentContent.classes[className].sections = {}
  }
  
  // Get current items for this section
  const currentItems = currentContent.classes[className].sections[sectionType] || []

  const newItem = {
    ...item,
    id: Date.now(),
    dateAdded: new Date().toISOString().split("T")[0],
  }

  const updatedItems = [newItem, ...currentItems]
  
  const updatedContent = {
    ...currentContent,
    classes: {
      ...currentContent.classes,
      [className]: {
        ...currentContent.classes[className],
        sections: {
          ...currentContent.classes[className].sections,
          [sectionType]: updatedItems,
        },
      },
    },
  }
  
  updateContent(updatedContent)
  return { success: true }
}

export function removeClassContentItem(className: string, sectionType: string, itemId: number) {
  const currentContent = getContent()
  const currentItems = currentContent.classes[className]?.sections[sectionType] || []
  const updatedItems = currentItems.filter((item: any) => item.id !== itemId)

  const updatedContent = {
    ...currentContent,
    classes: {
      ...currentContent.classes,
      [className]: {
        ...currentContent.classes[className],
        sections: {
          ...currentContent.classes[className].sections,
          [sectionType]: updatedItems,
        },
      },
    },
  }
  
  updateContent(updatedContent)
  return { success: true }
}

export function updateClassContentItem(className: string, sectionType: string, itemId: number, updates: any) {
  const currentContent = getContent()
  const currentItems = currentContent.classes[className]?.sections[sectionType] || []
  const updatedItems = currentItems.map((item: any) => (item.id === itemId ? { ...item, ...updates } : item))

  const updatedContent = {
    ...currentContent,
    classes: {
      ...currentContent.classes,
      [className]: {
        ...currentContent.classes[className],
        sections: {
          ...currentContent.classes[className].sections,
          [sectionType]: updatedItems,
        },
      },
    },
  }
  
  updateContent(updatedContent)
  return { success: true }
}

// Initialize content from localStorage on client side
if (typeof window !== "undefined") {
  loadContentFromStorage()
}
