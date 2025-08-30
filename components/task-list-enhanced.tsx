"use client";

import { useState, useMemo } from "react";
import TaskItem from "@/components/task-item";
import TaskFilters from "@/components/task-filters";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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

interface Category {
    id: string;
    name: string;
    color: string;
}

interface Filters {
    status: string;
    category: string;
    priority: string;
}

interface TaskListProps {
    tasks: Task[];
    categories: Category[];
    onTaskUpdate: (task: Task) => void;
    onTaskDelete: (taskId: string) => void;
}

export default function TaskList({
    tasks,
    categories,
    onTaskUpdate,
    onTaskDelete,
}: TaskListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<Filters>({
        status: "all",
        category: "all",
        priority: "all",
    });
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const filteredAndSortedTasks = useMemo(() => {
        let filtered = tasks;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (task) =>
                    task.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    task.description
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (filters.status !== "all") {
            if (filters.status === "completed") {
                filtered = filtered.filter((task) => task.completed);
            } else if (filters.status === "pending") {
                filtered = filtered.filter((task) => !task.completed);
            }
        }

        // Apply category filter
        if (filters.category !== "all") {
            if (filters.category === "none") {
                filtered = filtered.filter((task) => !task.category_id);
            } else {
                filtered = filtered.filter(
                    (task) => task.category_id === filters.category
                );
            }
        }

        // Apply priority filter
        if (filters.priority !== "all") {
            filtered = filtered.filter(
                (task) => task.priority === filters.priority
            );
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortBy) {
                case "title":
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case "priority":
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    aValue = priorityOrder[a.priority];
                    bValue = priorityOrder[b.priority];
                    break;
                case "due_date":
                    aValue = a.due_date
                        ? new Date(a.due_date).getTime()
                        : Infinity;
                    bValue = b.due_date
                        ? new Date(b.due_date).getTime()
                        : Infinity;
                    break;
                case "created_at":
                default:
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
            }

            if (sortOrder === "asc") {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return sorted;
    }, [tasks, searchTerm, filters, sortBy, sortOrder]);

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No tasks yet</p>
                    <p className="text-sm">
                        Create your first task to get started!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <TaskFilters
                filters={filters}
                onFiltersChange={setFilters}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                categories={categories}
            />

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Task Items */}
            <div className="space-y-2">
                {filteredAndSortedTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No tasks match your search and filters.</p>
                    </div>
                ) : (
                    filteredAndSortedTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            categories={categories}
                            onUpdate={onTaskUpdate}
                            onDelete={onTaskDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
