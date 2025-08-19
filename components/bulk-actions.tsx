"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, CheckSquare, Square, X } from "lucide-react"
import { updateTask, deleteTask } from "@/lib/task-actions"

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

interface BulkActionsProps {
  tasks: Task[]
  selectedTasks: string[]
  onSelectedTasksChange: (taskIds: string[]) => void
  onTasksUpdate: (tasks: Task[]) => void
  onTasksDelete: (taskIds: string[]) => void
}

export default function BulkActions({
  tasks,
  selectedTasks,
  onSelectedTasksChange,
  onTasksUpdate,
  onTasksDelete,
}: BulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      onSelectedTasksChange([])
    } else {
      onSelectedTasksChange(tasks.map((task) => task.id))
    }
  }

  const handleBulkComplete = async () => {
    setIsProcessing(true)
    try {
      const updatedTasks: Task[] = []
      for (const taskId of selectedTasks) {
        const task = tasks.find((t) => t.id === taskId)
        if (task) {
          const updatedTask = await updateTask(taskId, { completed: true })
          if (updatedTask) {
            updatedTasks.push(updatedTask)
          }
        }
      }
      onTasksUpdate(updatedTasks)
      onSelectedTasksChange([])
    } catch (error) {
      console.error("Failed to bulk complete tasks:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkIncomplete = async () => {
    setIsProcessing(true)
    try {
      const updatedTasks: Task[] = []
      for (const taskId of selectedTasks) {
        const task = tasks.find((t) => t.id === taskId)
        if (task) {
          const updatedTask = await updateTask(taskId, { completed: false })
          if (updatedTask) {
            updatedTasks.push(updatedTask)
          }
        }
      }
      onTasksUpdate(updatedTasks)
      onSelectedTasksChange([])
    } catch (error) {
      console.error("Failed to bulk incomplete tasks:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) {
      return
    }

    setIsProcessing(true)
    try {
      for (const taskId of selectedTasks) {
        await deleteTask(taskId)
      }
      onTasksDelete(selectedTasks)
      onSelectedTasksChange([])
    } catch (error) {
      console.error("Failed to bulk delete tasks:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (selectedTasks.length === 0) {
    return null
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedTasks.length === tasks.length}
                onCheckedChange={handleSelectAll}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className="text-sm font-medium">{selectedTasks.length} tasks selected</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkComplete}
              disabled={isProcessing}
              className="text-green-600 hover:text-green-700 bg-transparent"
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkIncomplete}
              disabled={isProcessing}
              className="text-orange-600 hover:text-orange-700 bg-transparent"
            >
              <Square className="h-4 w-4 mr-1" />
              Mark Incomplete
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="text-red-600 hover:text-red-700 bg-transparent"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>

            <Button variant="ghost" size="sm" onClick={() => onSelectedTasksChange([])} className="p-1">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
