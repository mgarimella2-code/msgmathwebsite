// Server-side content management that works across ALL devices
export async function getServerContent() {
  try {
    const response = await fetch('/api/content', {
      cache: 'no-store', // Always get fresh data
    })
    if (!response.ok) {
      throw new Error('Failed to fetch content')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching content:', error)
    throw error
  }
}

export async function saveServerContent(content: any) {
  try {
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    })
    
    if (!response.ok) {
      throw new Error('Failed to save content')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error saving content:', error)
    throw error
  }
}

export async function addClassContentItem(className: string, sectionType: string, item: any) {
  try {
    const currentContent = await getServerContent()
    
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
    
    const result = await saveServerContent(updatedContent)
    return { success: result.success }
  } catch (error) {
    console.error('Error adding class content item:', error)
    return { success: false, error: 'Failed to add item' }
  }
}

export async function removeClassContentItem(className: string, sectionType: string, itemId: number) {
  try {
    const currentContent = await getServerContent()
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
    
    const result = await saveServerContent(updatedContent)
    return { success: result.success }
  } catch (error) {
    console.error('Error removing class content item:', error)
    return { success: false, error: 'Failed to remove item' }
  }
}

export async function updateClassContentItem(className: string, sectionType: string, itemId: number, updates: any) {
  try {
    const currentContent = await getServerContent()
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
    
    const result = await saveServerContent(updatedContent)
    return { success: result.success }
  } catch (error) {
    console.error('Error updating class content item:', error)
    return { success: false, error: 'Failed to update item' }
  }
}

export async function updateAnnouncements(announcements: any[]) {
  try {
    const currentContent = await getServerContent()
    const updatedContent = {
      ...currentContent,
      announcements,
    }
    
    const result = await saveServerContent(updatedContent)
    return { success: result.success }
  } catch (error) {
    console.error('Error updating announcements:', error)
    return { success: false, error: 'Failed to update announcements' }
  }
}

export async function getStoredContent() {
  return await getServerContent();
}

export async function updateWelcomeContent(title: string, content: string) {
  try {
    const currentContent = await getServerContent();
    const updatedContent = {
      ...currentContent,
      welcome: { title, content },
    };
    const result = await saveServerContent(updatedContent);
    return { success: result.success };
  } catch (error) {
    console.error('Error updating welcome content:', error);
    return { success: false, error: 'Failed to update welcome content' };
  }
}

export async function updateContactContent(contact: any) {
  try {
    const currentContent = await getServerContent();
    const updatedContent = {
      ...currentContent,
      contact: contact,
    };
    const result = await saveServerContent(updatedContent);
    return { success: result.success };
  } catch (error) {
    console.error('Error updating contact content:', error);
    return { success: false, error: 'Failed to update contact content' };
  }
}

export async function updateImportantLinks(importantLinks: any[]) {
  try {
    const currentContent = await getServerContent();
    const updatedContent = {
      ...currentContent,
      importantLinks: importantLinks,
    };
    const result = await saveServerContent(updatedContent);
    return { success: result.success };
  } catch (error) {
    console.error('Error updating important links:', error);
    return { success: false, error: 'Failed to update important links' };
  }
}
