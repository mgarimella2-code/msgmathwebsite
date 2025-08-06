// Server-side content management that works across ALL devices
export async function getServerContent() {
  try {
    const response = await fetch('/api/content', {
      cache: 'no-store', // Always get fresh data
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status}`)
    }
    const data = await response.json()
    console.log('Loaded content from server:', Object.keys(data))
    return data
  } catch (error) {
    console.error('Error fetching content:', error)
    throw error
  }
}

export async function saveServerContent(content: any) {
  try {
    console.log('Saving content to server:', Object.keys(content))
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Failed to save content: ${response.status} - ${errorData.error || 'Unknown error'}`)
    }
    
    const result = await response.json()
    console.log('Successfully saved content to server')
    return result
  } catch (error) {
    console.error('Error saving content:', error)
    throw error
  }
}

export async function addClassContentItem(className: string, sectionType: string, item: any) {
  try {
    console.log(`Adding item to ${className} -> ${sectionType}:`, item)
    
    const currentContent = await getServerContent()
    console.log('Current content loaded, classes:', Object.keys(currentContent.classes))
    
    // Ensure the class exists
    if (!currentContent.classes[className]) {
      console.error(`Class ${className} not found in:`, Object.keys(currentContent.classes))
      return { success: false, error: `Class ${className} not found` }
    }
    
    // Ensure the sections object exists
    if (!currentContent.classes[className].sections) {
      console.log(`Creating sections object for ${className}`)
      currentContent.classes[className].sections = {}
    }
    
    // Get current items for this section
    const currentItems = currentContent.classes[className].sections[sectionType] || []
    console.log(`Current items in ${sectionType}:`, currentItems.length)

    const newItem = {
      ...item,
      id: Date.now(),
      dateAdded: new Date().toISOString().split("T")[0],
    }
    console.log('Created new item:', newItem)

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
    
    console.log(`Updated ${sectionType} section, now has ${updatedItems.length} items`)
    
    const result = await saveServerContent(updatedContent)
    console.log('Save result:', result)
    return { success: result.success }
  } catch (error) {
    console.error('Error adding class content item:', error)
    return { success: false, error: `Failed to add item: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function removeClassContentItem(className: string, sectionType: string, itemId: number) {
  try {
    console.log(`Removing item ${itemId} from ${className} -> ${sectionType}`)
    
    const currentContent = await getServerContent()
    const currentItems = currentContent.classes[className]?.sections[sectionType] || []
    const updatedItems = currentItems.filter((item: any) => item.id !== itemId)

    console.log(`Filtered items: ${currentItems.length} -> ${updatedItems.length}`)

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
    console.log(`Updating item ${itemId} in ${className} -> ${sectionType}:`, updates)
    
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
    console.log('Updating announcements:', announcements.length)
    
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
