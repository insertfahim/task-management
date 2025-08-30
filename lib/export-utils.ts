"use server";

interface Task {
    id: string;
    title: string;
    description: string | null;
    completed: boolean;
    category_id: string | null;
    priority: "low" | "medium" | "high";
    due_date: string | null;
    created_at: string;
    categories?: {
        id: string;
        name: string;
        color: string;
    } | null;
}

export async function exportTasksToCSV(tasks: Task[]): Promise<string> {
    // CSV headers
    const headers = [
        "Title",
        "Description",
        "Status",
        "Priority",
        "Category",
        "Due Date",
        "Created Date",
    ];

    // Convert tasks to CSV rows
    const rows = tasks.map((task) => [
        `"${task.title.replace(/"/g, '""')}"`, // Escape quotes
        `"${(task.description || "").replace(/"/g, '""')}"`,
        task.completed ? "Completed" : "Pending",
        task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
        task.categories
            ? `"${task.categories.name.replace(/"/g, '""')}"`
            : "None",
        task.due_date ? new Date(task.due_date).toLocaleDateString() : "",
        new Date(task.created_at).toLocaleDateString(),
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
    ].join("\n");

    return csvContent;
}
