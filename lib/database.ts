import { supabaseServer } from "./supabase-server"

export interface PageContent {
  id?: number
  page_type: string
  page_identifier?: string
  section_type: string
  title?: string
  content?: string
  link_url?: string
  display_order?: number
}

export interface ClassContent {
  id?: number
  class_name: string
  section_type: string
  title?: string
  content?: string
  link_url?: string
  display_order?: number
}

export interface ImportantLink {
  id?: number
  title: string
  url: string
  display_order?: number
}

export async function getPageContent(pageType: string, pageIdentifier?: string) {
  try {
    const query = supabaseServer.from("page_content").select("*").eq("page_type", pageType).order("display_order")

    if (pageIdentifier) {
      query.eq("page_identifier", pageIdentifier)
    }

    const { data, error } = await query
    if (error) {
      console.warn("Database query failed:", error.message)
      return []
    }
    return data || []
  } catch (error) {
    console.warn("Database connection failed:", error)
    return []
  }
}

export async function getImportantLinks() {
  try {
    const { data, error } = await supabaseServer.from("important_links").select("*").order("display_order")

    if (error) {
      console.warn("Database query failed:", error.message)
      return getDefaultImportantLinks()
    }
    return data || getDefaultImportantLinks()
  } catch (error) {
    console.warn("Database connection failed:", error)
    return getDefaultImportantLinks()
  }
}

export async function getClassContent(className: string) {
  try {
    const { data, error } = await supabaseServer
      .from("class_content")
      .select("*")
      .eq("class_name", className)
      .order("section_type", { ascending: true })
      .order("display_order", { ascending: true })

    if (error) {
      console.warn("Database query failed:", error.message)
      return []
    }
    return data || []
  } catch (error) {
    console.warn("Database connection failed:", error)
    return []
  }
}

// Fallback data when database is not available
function getDefaultImportantLinks(): ImportantLink[] {
  return [
    { id: 1, title: "Math 1 HW and Textbook", url: "https://my.mheducation.com/login", display_order: 1 },
    {
      id: 2,
      title: "AP PreCalc Flipped Math",
      url: "https://precalculus.flippedmath.com/ap-precalc.html",
      display_order: 2,
    },
    { id: 3, title: "AP Classroom", url: "https://myap.collegeboard.org/login", display_order: 3 },
    { id: 4, title: "Graphing Calculator", url: "https://desmos.com", display_order: 4 },
    { id: 5, title: "Powerschool", url: "https://concept-il.powerschool.com/teachers/home.html", display_order: 5 },
  ]
}

export async function updatePageContent(id: number, updates: Partial<PageContent>) {
  try {
    const { data, error } = await supabaseServer
      .from("page_content")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error("Failed to update page content:", error)
    throw error
  }
}

export async function createClassContent(content: ClassContent) {
  try {
    const { data, error } = await supabaseServer.from("class_content").insert(content).select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error("Failed to create class content:", error)
    throw error
  }
}

export async function updateClassContent(id: number, updates: Partial<ClassContent>) {
  try {
    const { data, error } = await supabaseServer
      .from("class_content")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error("Failed to update class content:", error)
    throw error
  }
}

export async function deleteClassContent(id: number) {
  try {
    const { error } = await supabaseServer.from("class_content").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Failed to delete class content:", error)
    throw error
  }
}
