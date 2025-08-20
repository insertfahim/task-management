"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import { updateTask, deleteTask } from "@/lib/task-actions";
import EditTaskDialog from "@/components/edit-task-dialog";

interface Task {
    id: string;
    title: string;
    description: string | null;
    completed: boolean;
    category_id: string | null;
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

interface TaskItemProps {
    task: Task;
    categories: Category[];
    onUpdate: (task: Task) => void;
    onDelete: (taskId: string) => void;
}

export default function TaskItem({
    task,
    categories,
    onUpdate,
    onDelete,
}: TaskItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggleComplete = async () => {
        setIsUpdating(true);
        try {
            const updatedTask = await updateTask(task.id, {
                completed: !task.completed,
            });
            if (updatedTask) {
                onUpdate(updatedTask);
            }
        } catch (error) {
            console.error("Failed to update task:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this task?")) {
            try {
                await deleteTask(task.id);
                onDelete(task.id);
            } catch (error) {
                console.error("Failed to delete task:", error);
            }
        }
    };

    return (
        <>
            <Card
                className={`transition-all duration-200 ${
                    task.completed ? "opacity-75" : ""
                }`}
            >
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <Checkbox
                            checked={task.completed}
                            onCheckedChange={handleToggleComplete}
                            disabled={isUpdating}
                            className="mt-1"
                        />

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <h3
                                        className={`font-medium ${
                                            task.completed
                                                ? "line-through text-muted-foreground"
                                                : "text-foreground"
                                        }`}
                                    >
                                        {task.title}
                                    </h3>
                                    {task.description && (
                                        <p
                                            className={`text-sm mt-1 ${
                                                task.completed
                                                    ? "line-through text-muted-foreground"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            {task.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDelete}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {task.categories && (
                                <div className="flex items-center gap-2 mt-3">
                                    <Badge
                                        variant="outline"
                                        style={{
                                            borderColor: task.categories.color,
                                        }}
                                    >
                                        <div
                                            className="w-2 h-2 rounded-full mr-1"
                                            style={{
                                                backgroundColor:
                                                    task.categories.color,
                                            }}
                                        />
                                        {task.categories.name}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <EditTaskDialog
                task={task}
                categories={categories}
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                onUpdate={onUpdate}
            />
        </>
    );
}
