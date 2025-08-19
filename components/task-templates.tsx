"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Zap, Plus } from "lucide-react"
import { createTask } from "@/lib/task-actions"

interface Category {
  id: string
  name: string
  color: string
}

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

interface TaskTemplate {
  title: string
  description: string
  priority: "low" | "medium" | "high"
  category?: string
}

interface TaskTemplatesProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  onTaskAdd: (task: Task) => void
}

const defaultTemplates: TaskTemplate[] = [
  {
    title: "Daily Standup Meeting",
    description: "Attend the daily team standup meeting",
    priority: "medium",
    category: "Work",
  },
  {
    title: "Review Pull Requests",
    description: "Review and provide feedback on pending pull requests",
    priority: "high",
    category: "Work",
  },
  {
    title: "Grocery Shopping",
    description: "Buy groceries for the week",
    priority: "medium",
    category: "Personal",
  },
  {
    title: "Exercise",
    description: "30 minutes of physical activity",
    priority: "medium",
    category: "Health",
  },
  {
    title: "Read Documentation",
    description: "Read and study technical documentation",
    priority: "low",
    category: "Work",
  },
  {
    title: "Plan Weekend Activities",
    description: "Plan activities and outings for the weekend",
    priority: "low",
    category: "Personal",
  },
]

export default function TaskTemplates({ isOpen, onClose, categories, onTaskAdd }: TaskTemplatesProps) {
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateFromTemplate = async (template: TaskTemplate) => {
    setIsCreating(true)
    try {
      // Find category by name
      const category = categories.find((cat) => cat.name === template.category)

      const newTask = await createTask({
        title: template.title,
        description: template.description,
        priority: template.priority,
        category_id: category?.id || null,
        due_date: null,
      })

      if (newTask) {
        onTaskAdd(newTask)
        onClose()
      }
    } catch (error) {
      console.error("Failed to create task from template:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Quick Task Templates
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {defaultTemplates.map((template, index) => {
            const category = categories.find((cat) => cat.name === template.category)
            return (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium">{template.title}</CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        template.priority === "high"
                          ? "border-red-200 text-red-700"
                          : template.priority === "medium"
                            ? "border-yellow-200 text-yellow-700"
                            : "border-green-200 text-green-700"
                      }
                    >
                      {template.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <div className="flex items-center justify-between">
                    {category && (
                      <Badge variant="outline" style={{ borderColor: category.color }}>
                        <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: category.color }} />
                        {category.name}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleCreateFromTemplate(template)}
                      disabled={isCreating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
