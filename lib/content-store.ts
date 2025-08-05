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

// Initialize content from localStorage on client side
if (typeof window !== "undefined") {
  loadContentFromStorage()
}
