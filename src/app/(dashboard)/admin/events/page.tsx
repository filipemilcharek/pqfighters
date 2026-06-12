"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Trash2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "" });

  useEffect(() => {
    loadEvents();
  }, []);

  function loadEvents() {
    fetch("/api/events")
      .then((r) => r.json())
      .then(setEvents);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setModalOpen(false);
    setForm({ title: "", description: "", date: "" });
    loadEvents();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este evento?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    loadEvents();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-content-primary">Eventos</h1>
        <Button onClick={() => setModalOpen(true)}>Novo Evento</Button>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-content-primary">{event.title}</h3>
                <p className="text-sm text-content-secondary mt-1">
                  {new Date(event.date + "T12:00:00").toLocaleDateString("pt-BR")}
                </p>
                {event.description && (
                  <p className="text-sm text-content-secondary mt-2">
                    {event.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(event.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        ))}
        {events.length === 0 && (
          <p className="text-center text-content-muted py-8">
            Nenhum evento cadastrado
          </p>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Evento"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Título"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Input
            label="Data"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              Descrição
            </label>
            <textarea
              className="w-full rounded-md border border-border bg-surface-tertiary px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <Button type="submit" className="w-full">
            Criar
          </Button>
        </form>
      </Modal>
    </div>
  );
}
