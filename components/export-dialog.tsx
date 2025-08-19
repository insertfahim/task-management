"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Download, FileText, Database, FileSpreadsheet } from "lucide-react"

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

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  categories: Category[]
}

export default function ExportDialog({ isOpen, onClose, tasks, categories }: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "txt">("csv")
  const [exportFilter, setExportFilter] = useState("all") // all, completed, pending
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [includeCompleted, setIncludeCompleted] = useState(true)
  const [includePending, setIncludePending] = useState(true)

  const getFilteredTasks = () => {
    let filteredTasks = [...tasks]

    // Filter by completion status
    if (exportFilter === "completed") {
      filteredTasks = filteredTasks.filter((task) => task.completed)
    } else if (exportFilter === "pending") {
      filteredTasks = filteredTasks.filter((task) => !task.completed)
    }

    // Filter by categories if any selected
    if (selectedCategories.length > 0) {
      filteredTasks = filteredTasks.filter((task) => task.category_id && selectedCategories.includes(task.category_id))
    }

    return filteredTasks
  }

  const exportToCSV = (tasks: Task[]) => {
    const headers = ["Title", "Description", "Status", "Priority", "Category", "Due Date", "Created Date"]
    const csvContent = [
      headers.join(","),
      ...tasks.map((task) =>
        [
          `"${task.title.replace(/"/g, '""')}"`,
          `"${(task.description || "").replace(/"/g, '""')}"`,
          task.completed ? "Completed" : "Pending",
          task.priority,
          task.categories?.name || "Uncategorized",
          task.due_date ? new Date(task.due_date).toLocaleDateString() : "",
          new Date(task.created_at).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `tasks-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = (tasks: Task[]) => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalTasks: tasks.length,
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        completed: task.completed,
        priority: task.priority,
        category: task.categories?.name || null,
        dueDate: task.due_date,
        createdAt: task.created_at,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `tasks-${new Date().toISOString().split("T")[0]}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToTXT = (tasks: Task[]) => {
    const content = [
      "TASK EXPORT",
      "=".repeat(50),
      `Export Date: ${new Date().toLocaleDateString()}`,
      `Total Tasks: ${tasks.length}`,
      "",
      ...tasks.map((task, index) =>
        [
          `${index + 1}. ${task.title}`,
          `   Status: ${task.completed ? "✓ Completed" : "○ Pending"}`,
          `   Priority: ${task.priority.toUpperCase()}`,
          `   Category: ${task.categories?.name || "Uncategorized"}`,
          task.description ? `   Description: ${task.description}` : "",
          task.due_date ? `   Due Date: ${new Date(task.due_date).toLocaleDateString()}` : "",
          `   Created: ${new Date(task.created_at).toLocaleDateString()}`,
          "",
        ]
          .filter(Boolean)
          .join("\n"),
      ),
    ].join("\n")

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `tasks-${new Date().toISOString().split("T")[0]}.txt`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExport = () => {
    const filteredTasks = getFilteredTasks()

    if (filteredTasks.length === 0) {
      alert("No tasks match the selected filters.")
      return
    }

    switch (exportFormat) {
      case "csv":
        exportToCSV(filteredTasks)
        break
      case "json":
        exportToJSON(filteredTasks)
        break
      case "txt":
        exportToTXT(filteredTasks)
        break
    }

    onClose()
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const filteredTasks = getFilteredTasks()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Export Tasks
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: "csv" | "json" | "txt") => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Spreadsheet)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    JSON (Data)
                  </div>
                </SelectItem>
                <SelectItem value="txt">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    TXT (Plain Text)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Options */}
          <div className="space-y-2">
            <Label>Filter Tasks</Label>
            <Select value={exportFilter} onValueChange={setExportFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="completed">Completed Only</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Categories (optional)</Label>
            <Card>
              <CardContent className="p-3">
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <label htmlFor={category.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">All categories will be included</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Export Preview</Label>
            <Card>
              <CardContent className="p-3">
                <p className="text-sm text-muted-foreground">{filteredTasks.length} tasks will be exported</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
