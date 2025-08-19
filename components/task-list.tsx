"use client"

import { useState } from "react"
import TaskItem from "@/components/task-item"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  priority: "low" | "medium" | "high"
  due_date: string | null
  category_id: string | null
  created_at: string
  categories?: {
    id: string
    name: string
    color: string
  } | null
}

interface Category {
  id: string
  name: string
  color: string
}

interface TaskListProps {
  tasks: Task[]
  categories: Category[]
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  selectedTasks?: string[]
  onSelectedTasksChange?: (taskIds: string[]) => void
}

export default function TaskList({
  tasks,
  categories,
  onTaskUpdate,
  onTaskDelete,
  selectedTasks = [],
  onSelectedTasksChange,
}: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No tasks yet</p>
          <p className="text-sm">Create your first task to get started!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks match your search.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              categories={categories}
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
              isSelected={selectedTasks.includes(task.id)}
              onSelectionChange={(selected) => {
                if (onSelectedTasksChange) {
                  if (selected) {
                    onSelectedTasksChange([...selectedTasks, task.id])
                  } else {
                    onSelectedTasksChange(selectedTasks.filter((id) => id !== task.id))
                  }
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}
