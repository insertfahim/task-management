"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CreateCategoryData {
  name: string
  color: string
}

interface UpdateCategoryData {
  name?: string
  color?: string
}

export async function createCategory(data: CreateCategoryData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data: category, error } = await supabase
    .from("categories")
    .insert({
      ...data,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating category:", error)
    throw new Error("Failed to create category")
  }

  revalidatePath("/")
  return category
}

export async function updateCategory(categoryId: string, data: UpdateCategoryData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data: category, error } = await supabase
    .from("categories")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", categoryId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating category:", error)
    throw new Error("Failed to update category")
  }

  revalidatePath("/")
  return category
}

export async function deleteCategory(categoryId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { error } = await supabase.from("categories").delete().eq("id", categoryId).eq("user_id", user.id)

  if (error) {
    console.error("Error deleting category:", error)
    throw new Error("Failed to delete category")
  }

  revalidatePath("/")
  return true
}
