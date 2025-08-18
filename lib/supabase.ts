import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Store and retrieve content from Supabase
export async function saveContentToDatabase(content: any) {
  try {
    const { data, error } = await supabase
      .from("website_content")
      .upsert([
        {
          id: 1, // Single row for all content
          content: content,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error saving to database:", error)
    return { success: false, error }
  }
}

export async function loadContentFromDatabase() {
  try {
    const { data, error } = await supabase.from("website_content").select("content").eq("id", 1).single()

    if (error) throw error
    return { success: true, content: data?.content }
  } catch (error) {
    console.error("Error loading from database:", error)
    return { success: false, error }
  }
}
