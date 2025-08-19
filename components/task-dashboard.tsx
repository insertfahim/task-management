"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, Plus, LogOut, Zap, BarChart3, Download } from "lucide-react"
import { signOut } from "@/lib/actions"
import TaskList from "@/components/task-list"
import AddTaskDialog from "@/components/add-task-dialog"
import CategoryManager from "@/components/category-manager"
import TaskFilters from "@/components/task-filters"
import BulkActions from "@/components/bulk-actions"
import TaskTemplates from "@/components/task-templates"
import ProgressAnalytics from "@/components/progress-analytics"
import ExportDialog from "@/components/export-dialog"
import NotificationSystem from "@/components/notification-system"
import NotificationSettings from "@/components/notification-settings"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

interface TaskDashboardProps {
  initialTasks: Task[]
  categories: Category[]
  user: { id: string; email?: string }
}

export default function TaskDashboard({ initialTasks, categories, user }: TaskDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  // Filter and sort states
  const [filters, setFilters] = useState({
    status: "all", // all, pending, completed
    category: "all",
    priority: "all",
    dueDateFilter: "all", // all, overdue, today, week, month
  })
  const [sortBy, setSortBy] = useState("created_at") // created_at, due_date, priority, title
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const getFilteredAndSortedTasks = () => {
    let filteredTasks = [...tasks]

    // Status filter
    if (filters.status === "pending") {
      filteredTasks = filteredTasks.filter((task) => !task.completed)
    } else if (filters.status === "completed") {
      filteredTasks = filteredTasks.filter((task) => task.completed)
    }

    // Category filter
    if (filters.category !== "all") {
      if (filters.category === "none") {
        filteredTasks = filteredTasks.filter((task) => !task.category_id)
      } else {
        filteredTasks = filteredTasks.filter((task) => task.category_id === filters.category)
      }
    }

    // Priority filter
    if (filters.priority !== "all") {
      filteredTasks = filteredTasks.filter((task) => task.priority === filters.priority)
    }

    // Due date filter
    if (filters.dueDateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

      filteredTasks = filteredTasks.filter((task) => {
        if (!task.due_date) return filters.dueDateFilter === "none"
        const dueDate = new Date(task.due_date)

        switch (filters.dueDateFilter) {
          case "overdue":
            return dueDate < today && !task.completed
          case "today":
            return dueDate.toDateString() === today.toDateString()
          case "week":
            return dueDate >= today && dueDate <= weekFromNow
          case "month":
            return dueDate >= today && dueDate <= monthFromNow
          case "none":
            return false
          default:
            return true
        }
      })
    }

    // Sorting
    filteredTasks.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case "due_date":
          aValue = a.due_date ? new Date(a.due_date).getTime() : 0
          bValue = b.due_date ? new Date(b.due_date).getTime() : 0
          break
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        default: // created_at
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filteredTasks
  }

  const filteredTasks = getFilteredAndSortedTasks()
  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const pendingTasks = totalTasks - completedTasks
  const overdueTasks = tasks.filter(
    (task) => task.due_date && new Date(task.due_date) < new Date() && !task.completed,
  ).length

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const handleTaskDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  const handleTaskAdd = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev])
  }

  const handleCategoryUpdate = (updatedCategories: Category[]) => {
    setCategoriesList(updatedCategories)
  }

  const handleBulkTasksUpdate = (updatedTasks: Task[]) => {
    setTasks((prev) => {
      const updatedMap = new Map(updatedTasks.map((task) => [task.id, task]))
      return prev.map((task) => updatedMap.get(task.id) || task)
    })
  }

  const handleBulkTasksDelete = (taskIds: string[]) => {
    setTasks((prev) => prev.filter((task) => !taskIds.includes(task.id)))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Task Manager</h1>
            <p className="text-muted-foreground">Stay organized and productive</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Created by Tahsina Amrin Neha</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">{user.email}</div>
          <NotificationSystem tasks={tasks} />
          <ThemeToggle />
          <form action={signOut}>
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Badge variant="secondary">{pendingTasks}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Badge variant="default" className="bg-green-600">
              {completedTasks}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Badge variant="destructive">{overdueTasks}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <TaskFilters
          filters={filters}
          onFiltersChange={setFilters}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          categories={categoriesList}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Task List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Your Tasks
                  {filteredTasks.length !== totalTasks && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({filteredTasks.length} of {totalTasks})
                    </span>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExportOpen(true)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTemplatesOpen(true)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <BulkActions
                tasks={filteredTasks}
                selectedTasks={selectedTasks}
                onSelectedTasksChange={setSelectedTasks}
                onTasksUpdate={handleBulkTasksUpdate}
                onTasksDelete={handleBulkTasksDelete}
              />
              <TaskList
                tasks={filteredTasks}
                categories={categoriesList}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                selectedTasks={selectedTasks}
                onSelectedTasksChange={setSelectedTasks}
              />
            </CardContent>
          </Card>
        </div>

        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Categories</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCategoryManagerOpen(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      filters.category === "all" ? "bg-blue-100 dark:bg-blue-900" : "bg-muted/50 hover:bg-muted"
                    }`}
                    onClick={() => setFilters((prev) => ({ ...prev, category: "all" }))}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <span className="text-sm font-medium">All Categories</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {tasks.length}
                    </Badge>
                  </div>

                  {categoriesList.map((category) => {
                    const categoryTasks = tasks.filter((task) => task.category_id === category.id)
                    return (
                      <div
                        key={category.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          filters.category === category.id
                            ? "bg-blue-100 dark:bg-blue-900"
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                        onClick={() => setFilters((prev) => ({ ...prev, category: category.id }))}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {categoryTasks.length}
                        </Badge>
                      </div>
                    )
                  })}

                  {/* Uncategorized tasks */}
                  {tasks.some((task) => !task.category_id) && (
                    <div
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        filters.category === "none" ? "bg-blue-100 dark:bg-blue-900" : "bg-muted/50 hover:bg-muted"
                      }`}
                      onClick={() => setFilters((prev) => ({ ...prev, category: "none" }))}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                        <span className="text-sm font-medium">Uncategorized</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {tasks.filter((task) => !task.category_id).length}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsAnalyticsOpen(true)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Progress
                </Button>
              </CardContent>
            </Card>
          </div>
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

      <TaskTemplates
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        categories={categoriesList}
        onTaskAdd={handleTaskAdd}
      />

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        tasks={filteredTasks}
        categories={categoriesList}
      />

      <NotificationSettings isOpen={isNotificationSettingsOpen} onClose={() => setIsNotificationSettingsOpen(false)} />

      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Progress Analytics</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <ProgressAnalytics tasks={tasks} categories={categoriesList} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
