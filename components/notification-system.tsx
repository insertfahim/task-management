"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, BellOff, X, Clock, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

interface Notification {
  id: string
  type: "due_today" | "overdue" | "reminder"
  task: Task
  message: string
  timestamp: Date
}

interface NotificationSystemProps {
  tasks: Task[]
}

export default function NotificationSystem({ tasks }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false)
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const { today, now } = useStableDates()

  useEffect(() => {
    // Check if browser supports notifications
    if ("Notification" in window) {
      setHasPermission(Notification.permission === "granted")
    }
  }, [])

  useEffect(() => {
    // Generate notifications based on tasks only when dates are available
    if (!today || !now) return
    
    const newNotifications: Notification[] = []

    tasks.forEach((task) => {
      if (task.completed || !task.due_date) return

      const dueDate = new Date(task.due_date)
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

      // Overdue tasks
      if (dueDateOnly < today) {
        newNotifications.push({
          id: `overdue-${task.id}`,
          type: "overdue",
          task,
          message: `Task "${task.title}" is overdue`,
          timestamp: now,
        })
      }

      // Due today tasks
      if (dueDateOnly.getTime() === today.getTime()) {
        newNotifications.push({
          id: `due-today-${task.id}`,
          type: "due_today",
          task,
          message: `Task "${task.title}" is due today`,
          timestamp: now,
        })
      }
    })

    setNotifications(newNotifications)

    // Send browser notifications if enabled
    if (isNotificationsEnabled && hasPermission && newNotifications.length > 0) {
      newNotifications.forEach((notification) => {
        if (notification.type === "overdue" || notification.type === "due_today") {
          new Notification("Task Manager", {
            body: notification.message,
            icon: "/favicon.ico",
            tag: notification.id,
          })
        }
      })
    }
  }, [tasks, today, now, isNotificationsEnabled, hasPermission])

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setHasPermission(permission === "granted")
      if (permission === "granted") {
        setIsNotificationsEnabled(true)
      }
    }
  }

  const dismissNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "due_today":
        return <Clock className="h-4 w-4 text-orange-600" />
      default:
        return <Bell className="h-4 w-4 text-blue-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "overdue":
        return "border-red-200 bg-red-50 dark:bg-red-950"
      case "due_today":
        return "border-orange-200 bg-orange-50 dark:bg-orange-950"
      default:
        return "border-blue-200 bg-blue-50 dark:bg-blue-950"
    }
  }

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button variant="outline" size="sm" onClick={() => setIsNotificationsPanelOpen(true)} className="relative">
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notifications Panel */}
      <Dialog open={isNotificationsPanelOpen} onOpenChange={setIsNotificationsPanelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Notifications
              </div>
              <div className="flex items-center gap-2">
                {!hasPermission ? (
                  <Button size="sm" variant="outline" onClick={requestNotificationPermission}>
                    Enable Notifications
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
                  >
                    {isNotificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id} className={getNotificationColor(notification.type)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className={
                                notification.task.priority === "high"
                                  ? "border-red-200 text-red-700"
                                  : notification.task.priority === "medium"
                                    ? "border-yellow-200 text-yellow-700"
                                    : "border-green-200 text-green-700"
                              }
                            >
                              {notification.task.priority}
                            </Badge>
                            {notification.task.categories && (
                              <Badge variant="outline" style={{ borderColor: notification.task.categories.color }}>
                                <div
                                  className="w-2 h-2 rounded-full mr-1"
                                  style={{ backgroundColor: notification.task.categories.color }}
                                />
                                {notification.task.categories.name}
                              </Badge>
                            )}
                          </div>
                          {notification.task.due_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Due: {new Date(notification.task.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissNotification(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotifications([])}
                className="text-muted-foreground"
              >
                Clear All
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
