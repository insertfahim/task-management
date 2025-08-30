"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    shouldSendNotification,
    formatNotificationMessage,
    type NotificationPreferences,
    defaultNotificationPreferences,
} from "@/lib/notification-shared";

interface Task {
    id: string;
    title: string;
    description: string | null;
    completed: boolean;
    category_id: string | null;
    priority: "low" | "medium" | "high";
    due_date: string | null;
    created_at: string;
    categories?: {
        id: string;
        name: string;
        color: string;
    } | null;
}

interface NotificationSystemProps {
    tasks: Task[];
}

interface Notification {
    id: string;
    task: Task;
    type: "due_soon" | "due_today" | "overdue";
    message: string;
    timestamp: Date;
}

export default function NotificationSystem({ tasks }: NotificationSystemProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [preferences, setPreferences] = useState<NotificationPreferences>(
        defaultNotificationPreferences
    );
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Load preferences from localStorage
        const savedPrefs = localStorage.getItem(
            "task-notification-preferences"
        );
        if (savedPrefs) {
            setPreferences(JSON.parse(savedPrefs));
        }
    }, []);

    useEffect(() => {
        // Check for notifications
        const now = new Date();
        const newNotifications: Notification[] = [];

        tasks.forEach((task) => {
            const { shouldNotify, type } = shouldSendNotification(
                task,
                preferences,
                now
            );

            if (shouldNotify && type) {
                // Check if we already have a notification for this task
                const existingNotification = notifications.find(
                    (n) => n.task.id === task.id
                );

                if (!existingNotification) {
                    newNotifications.push({
                        id: `${task.id}-${type}-${Date.now()}`,
                        task,
                        type,
                        message: formatNotificationMessage(task, type),
                        timestamp: now,
                    });
                }
            }
        });

        if (newNotifications.length > 0) {
            setNotifications((prev) => [...prev, ...newNotifications]);

            // Show browser notification if enabled
            if (
                preferences.browserNotifications &&
                "Notification" in window &&
                Notification.permission === "granted"
            ) {
                newNotifications.forEach((notification) => {
                    new Notification("Task Manager", {
                        body: notification.message,
                        icon: "/favicon.ico",
                    });
                });
            }
        }
    }, [tasks, preferences]);

    const requestNotificationPermission = async () => {
        if ("Notification" in window && Notification.permission === "default") {
            await Notification.requestPermission();
        }
    };

    const dismissNotification = (notificationId: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const updatePreferences = (newPrefs: Partial<NotificationPreferences>) => {
        const updated = { ...preferences, ...newPrefs };
        setPreferences(updated);
        localStorage.setItem(
            "task-notification-preferences",
            JSON.stringify(updated)
        );
    };

    const unreadCount = notifications.length;

    return (
        <>
            {/* Notification Bell */}
            <div className="relative">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative"
                >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-red-500">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>

                {/* Notification Panel */}
                {isOpen && (
                    <Card className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto z-50 shadow-lg">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">
                                    Notifications
                                </CardTitle>
                                <div className="flex gap-1">
                                    {unreadCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearAllNotifications}
                                            className="text-xs h-6 px-2"
                                        >
                                            Clear All
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsOpen(false)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                            {notifications.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No notifications
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-3 rounded-lg border ${
                                                notification.type === "overdue"
                                                    ? "border-red-200 bg-red-50"
                                                    : notification.type ===
                                                      "due_today"
                                                    ? "border-yellow-200 bg-yellow-50"
                                                    : "border-blue-200 bg-blue-50"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {notification.timestamp.toLocaleDateString()}{" "}
                                                        at{" "}
                                                        {notification.timestamp.toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        dismissNotification(
                                                            notification.id
                                                        )
                                                    }
                                                    className="h-6 w-6 p-0 ml-2"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Settings */}
                            <div className="border-t mt-4 pt-4 space-y-3">
                                <h4 className="text-sm font-medium">
                                    Notification Settings
                                </h4>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={
                                                preferences.dueDateReminders
                                            }
                                            onChange={(e) =>
                                                updatePreferences({
                                                    dueDateReminders:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        Due date reminders
                                    </label>

                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={
                                                preferences.overdueReminders
                                            }
                                            onChange={(e) =>
                                                updatePreferences({
                                                    overdueReminders:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        Overdue reminders
                                    </label>

                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={
                                                preferences.browserNotifications
                                            }
                                            onChange={(e) => {
                                                updatePreferences({
                                                    browserNotifications:
                                                        e.target.checked,
                                                });
                                                if (e.target.checked) {
                                                    requestNotificationPermission();
                                                }
                                            }}
                                        />
                                        Browser notifications
                                    </label>

                                    <div className="flex items-center gap-2 text-sm">
                                        <label htmlFor="reminderHours">
                                            Remind me
                                        </label>
                                        <input
                                            id="reminderHours"
                                            type="number"
                                            min="1"
                                            max="168"
                                            value={preferences.reminderHours}
                                            onChange={(e) =>
                                                updatePreferences({
                                                    reminderHours:
                                                        parseInt(
                                                            e.target.value
                                                        ) || 24,
                                                })
                                            }
                                            className="w-16 px-2 py-1 border rounded text-xs"
                                        />
                                        <span>hours before due</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
