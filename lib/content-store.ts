"use client"

import { siteContent as initialContent } from "./content"

// Simple in-memory store for content updates
let contentStore = { ...initialContent }

export function getContent() {
  return contentStore
}

export function updateContent(newContent: typeof initialContent) {
  contentStore = { ...newContent }
  // Save to localStorage for persistence
  if (typeof window !== "undefined") {
    localStorage.setItem("ms-g-content", JSON.stringify(newContent))
    // Trigger storage event to sync across tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'ms-g-content',
      newValue: JSON.stringify(newContent)
    }))
  }
}

export function loadContentFromStorage() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("ms-g-content")
    if (saved) {
      try {
        contentStore = JSON.parse(saved)
      } catch (error) {
        console.warn("Failed to load saved content:", error)
      }
    }
  }
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
  
  // Listen for storage changes from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'ms-g-content' && e.newValue) {
      try {
        contentStore = JSON.parse(e.newValue)
      } catch (error) {
        console.warn("Failed to sync content from storage:", error)
      }
    }
  })
}
