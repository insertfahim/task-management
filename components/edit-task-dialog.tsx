"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { updateTask } from "@/lib/task-actions"

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
  category_id: string | null
  created_at: string
  categories?: {
    id: string
    name: string
    color: string
  } | null
}

interface EditTaskDialogProps {
  task: Task
  categories: Category[]
  isOpen: boolean
  onClose: () => void
  onUpdate: (task: Task) => void
}

export default function EditTaskDialog({ task, categories, isOpen, onClose, onUpdate }: EditTaskDialogProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || "")
  const [categoryId, setCategoryId] = useState<string>(task.category_id || "none")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description || "")
    setCategoryId(task.category_id || "none")
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      const updatedTask = await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        category_id: categoryId === "none" ? null : categoryId,
      })

      if (updatedTask) {
        onUpdate(updatedTask)
        onClose()
      }
    } catch (error) {
      console.error("Failed to update task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Updating..." : "Update Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
