"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface CreateTaskData {
    title: string;
    description: string | null;
    category_id: string | null;
}

interface UpdateTaskData {
    title?: string;
    description?: string | null;
    completed?: boolean;
    category_id?: string | null;
}

export async function createTask(data: CreateTaskData) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { data: task, error } = await supabase
        .from("tasks")
        .insert({
            ...data,
            user_id: user.id,
        })
        .select(
            `
      *,
      categories (
        id,
        name,
        color
      )
    `
        )
        .single();

    if (error) {
        console.error("Error creating task:", error);
        throw new Error("Failed to create task");
    }

    revalidatePath("/");
    return task;
}

export async function updateTask(taskId: string, data: UpdateTaskData) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { data: task, error } = await supabase
        .from("tasks")
        .update({
            ...data,
            updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .eq("user_id", user.id)
        .select(
            `
      *,
      categories (
        id,
        name,
        color
      )
    `
        )
        .single();

    if (error) {
        console.error("Error updating task:", error);
        throw new Error("Failed to update task");
    }

    revalidatePath("/");
    return task;
}

export async function deleteTask(taskId: string) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error deleting task:", error);
        throw new Error("Failed to delete task");
    }

    revalidatePath("/");
    return true;
}
