// Shared notification utility functions (can be used on both client and server)

export interface NotificationPreferences {
  browserNotifications: boolean
  emailNotifications: boolean
  dueDateReminders: boolean
  overdueReminders: boolean
  reminderHours: number // hours before due date to remind
}

export const defaultNotificationPreferences: NotificationPreferences = {
  browserNotifications: true,
  emailNotifications: false,
  dueDateReminders: true,
  overdueReminders: true,
  reminderHours: 24,
}

export function shouldSendNotification(
  task: any,
  preferences: NotificationPreferences,
  now: Date = new Date(),
): { shouldNotify: boolean; type: "due_soon" | "due_today" | "overdue" | null } {
  if (task.completed || !task.due_date) {
    return { shouldNotify: false, type: null }
  }

  const dueDate = new Date(task.due_date)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

  // Overdue
  if (dueDateOnly < today && preferences.overdueReminders) {
    return { shouldNotify: true, type: "overdue" }
  }

  // Due today
  if (dueDateOnly.getTime() === today.getTime() && preferences.dueDateReminders) {
    return { shouldNotify: true, type: "due_today" }
  }

  // Due soon (within reminder hours)
  const reminderTime = new Date(dueDate.getTime() - preferences.reminderHours * 60 * 60 * 1000)
  if (now >= reminderTime && now < dueDate && preferences.dueDateReminders) {
    return { shouldNotify: true, type: "due_soon" }
  }

  return { shouldNotify: false, type: null }
}

export function formatNotificationMessage(task: any, type: "due_soon" | "due_today" | "overdue"): string {
  switch (type) {
    case "overdue":
      return `Task "${task.title}" is overdue!`
    case "due_today":
      return `Task "${task.title}" is due today`
    case "due_soon":
      return `Task "${task.title}" is due soon`
    default:
      return `Reminder: ${task.title}`
  }
}
