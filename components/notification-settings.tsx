"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Settings, Bell } from "lucide-react"

interface NotificationPreferences {
  browserNotifications: boolean
  dueDateReminders: boolean
  overdueReminders: boolean
  reminderHours: number
}

interface NotificationSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    browserNotifications: true,
    dueDateReminders: true,
    overdueReminders: true,
    reminderHours: 24,
  })
  const [isClient, setIsClient] = useState(false)

  // Ensure this only runs on the client side
  useEffect(() => {
    setIsClient(true)
    // Load preferences from localStorage on client side
    if (typeof window !== 'undefined') {
      const savedPreferences = localStorage.getItem("notificationPreferences")
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences))
        } catch (error) {
          console.error('Failed to parse notification preferences:', error)
        }
      }
    }
  }, [])

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean | number) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    // Save preferences to localStorage only on client side
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem("notificationPreferences", JSON.stringify(preferences))
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Notification Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Browser Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="browser-notifications">Enable browser notifications</Label>
                <Switch
                  id="browser-notifications"
                  checked={preferences.browserNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange("browserNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="due-date-reminders">Due date reminders</Label>
                <Switch
                  id="due-date-reminders"
                  checked={preferences.dueDateReminders}
                  onCheckedChange={(checked) => handlePreferenceChange("dueDateReminders", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="overdue-reminders">Overdue task alerts</Label>
                <Switch
                  id="overdue-reminders"
                  checked={preferences.overdueReminders}
                  onCheckedChange={(checked) => handlePreferenceChange("overdueReminders", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Reminder timing</Label>
                <Select
                  value={preferences.reminderHours.toString()}
                  onValueChange={(value) => handlePreferenceChange("reminderHours", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour before</SelectItem>
                    <SelectItem value="6">6 hours before</SelectItem>
                    <SelectItem value="24">1 day before</SelectItem>
                    <SelectItem value="48">2 days before</SelectItem>
                    <SelectItem value="168">1 week before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
