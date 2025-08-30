"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, Target, Clock } from "lucide-react"
import { useStableDates } from "@/lib/use-client-date"

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

interface ProgressAnalyticsProps {
  tasks: Task[]
  categories: Category[]
}

export default function ProgressAnalytics({ tasks, categories }: ProgressAnalyticsProps) {
  const { today, weekAgo } = useStableDates()
  
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Priority breakdown
  const highPriorityTasks = tasks.filter((task) => task.priority === "high")
  const mediumPriorityTasks = tasks.filter((task) => task.priority === "medium")
  const lowPriorityTasks = tasks.filter((task) => task.priority === "low")

  const highCompleted = highPriorityTasks.filter((task) => task.completed).length
  const mediumCompleted = mediumPriorityTasks.filter((task) => task.completed).length
  const lowCompleted = lowPriorityTasks.filter((task) => task.completed).length

  // Due date analysis - only calculate if dates are available
  const overdueTasks = today ? tasks.filter((task) => task.due_date && new Date(task.due_date) < today && !task.completed) : []
  const dueTodayTasks = today ? tasks.filter(
    (task) => task.due_date && new Date(task.due_date).toDateString() === today.toDateString(),
  ) : []

  // Category breakdown
  const categoryStats = categories.map((category) => {
    const categoryTasks = tasks.filter((task) => task.category_id === category.id)
    const categoryCompleted = categoryTasks.filter((task) => task.completed).length
    const categoryRate = categoryTasks.length > 0 ? Math.round((categoryCompleted / categoryTasks.length) * 100) : 0

    return {
      ...category,
      total: categoryTasks.length,
      completed: categoryCompleted,
      rate: categoryRate,
    }
  })

  // Recent activity (tasks created in last 7 days)
  const recentTasks = weekAgo ? tasks.filter((task) => new Date(task.created_at) >= weekAgo) : []

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-2xl font-bold text-blue-600">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{completedTasks} completed</span>
              <span>{totalTasks - completedTasks} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Priority Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-red-200 text-red-700">
                  High
                </Badge>
                <span className="text-sm">{highPriorityTasks.length} tasks</span>
              </div>
              <span className="text-sm font-medium">
                {highCompleted}/{highPriorityTasks.length}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-yellow-200 text-yellow-700">
                  Medium
                </Badge>
                <span className="text-sm">{mediumPriorityTasks.length} tasks</span>
              </div>
              <span className="text-sm font-medium">
                {mediumCompleted}/{mediumPriorityTasks.length}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-green-200 text-green-700">
                  Low
                </Badge>
                <span className="text-sm">{lowPriorityTasks.length} tasks</span>
              </div>
              <span className="text-sm font-medium">
                {lowCompleted}/{lowPriorityTasks.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Due Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Due Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Overdue</span>
              <Badge variant="destructive">{overdueTasks.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Due Today</span>
              <Badge variant="outline" className="border-orange-200 text-orange-700">
                {dueTodayTasks.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryStats
              .filter((cat) => cat.total > 0)
              .sort((a, b) => b.rate - a.rate)
              .map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {category.completed}/{category.total} ({category.rate}%)
                    </span>
                  </div>
                  <Progress value={category.rate} className="h-1" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{recentTasks.length}</div>
            <div className="text-sm text-muted-foreground">tasks created this week</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
