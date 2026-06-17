"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Bell, X } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  reads: { id: string }[];
}

export function NotificationBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data: Notification[]) => {
        const unread = data.filter(
          (n) => !n.reads || n.reads.length === 0
        );
        setNotifications(unread);
      });
  }, []);

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  if (notifications.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {notifications.map((n) => (
        <Card key={n.id} className="!p-4 border-l-4 border-l-accent">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <Bell size={18} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-sm text-content-primary">{n.title}</p>
                <p className="text-sm text-content-secondary mt-0.5">{n.message}</p>
              </div>
            </div>
            <button
              onClick={() => markAsRead(n.id)}
              className="text-content-muted hover:text-content-primary shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
