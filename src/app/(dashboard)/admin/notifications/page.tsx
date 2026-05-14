"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", message: "" });

  useEffect(() => {
    loadNotifications();
  }, []);

  function loadNotifications() {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then(setNotifications);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setModalOpen(false);
    setForm({ title: "", message: "" });
    loadNotifications();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">Notificações</h1>
        <Button onClick={() => setModalOpen(true)}>Nova Notificação</Button>
      </div>

      <div className="grid gap-4">
        {notifications.map((n) => (
          <Card key={n.id}>
            <h3 className="font-semibold text-zinc-50">{n.title}</h3>
            <p className="text-sm text-zinc-300 mt-1">{n.message}</p>
            <p className="text-xs text-zinc-500 mt-2">
              {new Date(n.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </Card>
        ))}
        {notifications.length === 0 && (
          <p className="text-center text-zinc-500 py-8">
            Nenhuma notificação enviada
          </p>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova Notificação"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Título"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-zinc-50 mb-1">
              Mensagem
            </label>
            <textarea
              className="w-full rounded-md border border-zinc-800 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50"
              rows={4}
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Enviar
          </Button>
        </form>
      </Modal>
    </div>
  );
}
