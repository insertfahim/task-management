"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Plus, LogOut, Download } from "lucide-react";
import { signOut } from "@/lib/actions";
import TaskList from "@/components/task-list-enhanced";
import AddTaskDialog from "@/components/add-task-dialog";
import CategoryManager from "@/components/category-manager";
import NotificationSystem from "@/components/notification-system";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { exportTasksToCSV } from "@/lib/export-utils";
import { downloadCSV } from "@/lib/client-utils";

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

interface TaskDashboardProps {
    initialTasks: Task[];
    categories: Category[];
    user: { id: string; email?: string };
}

export default function TaskDashboard({
    initialTasks,
    categories,
    user,
}: TaskDashboardProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [categoriesList, setCategoriesList] =
        useState<Category[]>(categories);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

    const completedTasks = tasks.filter((task) => task.completed).length;
    const totalTasks = tasks.length;
    const pendingTasks = totalTasks - completedTasks;

    const handleTaskUpdate = (updatedTask: Task) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === updatedTask.id ? updatedTask : task
            )
        );
    };

    const handleTaskDelete = (taskId: string) => {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
    };

    const handleTaskAdd = (newTask: Task) => {
        setTasks((prev) => [newTask, ...prev]);
    };

    const handleCategoryUpdate = (updatedCategories: Category[]) => {
        setCategoriesList(updatedCategories);
    };

    const handleExportCSV = async () => {
        try {
            const csvContent = await exportTasksToCSV(tasks);
            downloadCSV(
                csvContent,
                `tasks-${new Date().toISOString().split("T")[0]}.csv`
            );
        } catch (error) {
            console.error("Failed to export tasks:", error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <CheckSquare className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Task Manager
                        </h1>
                        <p className="text-muted-foreground">
                            Stay organized and productive
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            Created by Tahsina Amrin Neha
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <NotificationSystem tasks={tasks} />
                    <ThemeToggle />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {user.email}
                    </div>
                    <form action={signOut}>
                        <Button variant="outline" size="sm">
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </form>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Tasks
                        </CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTasks}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending
                        </CardTitle>
                        <Badge variant="secondary">{pendingTasks}</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {pendingTasks}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Completed
                        </CardTitle>
                        <Badge variant="default" className="bg-green-600">
                            {completedTasks}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {completedTasks}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-6">
                {/* Task List */}
                <div className="col-span-1">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Your Tasks</CardTitle>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleExportCSV}
                                        variant="outline"
                                        size="sm"
                                        disabled={tasks.length === 0}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export CSV
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            setIsCategoryManagerOpen(true)
                                        }
                                        variant="outline"
                                        size="sm"
                                    >
                                        Manage Categories
                                    </Button>
                                    <Button
                                        onClick={() => setIsAddDialogOpen(true)}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Task
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <TaskList
                                tasks={tasks}
                                categories={categoriesList}
                                onTaskUpdate={handleTaskUpdate}
                                onTaskDelete={handleTaskDelete}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialogs */}
            <AddTaskDialog
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                categories={categoriesList}
                onTaskAdd={handleTaskAdd}
            />

            <CategoryManager
                isOpen={isCategoryManagerOpen}
                onClose={() => setIsCategoryManagerOpen(false)}
                categories={categoriesList}
                onCategoriesUpdate={handleCategoryUpdate}
            />
        </div>
    );
}
