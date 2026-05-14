"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { DAY_NAMES } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface Slot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function SlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "09:00",
  });

  useEffect(() => {
    loadSlots();
  }, []);

  function loadSlots() {
    fetch("/api/slots")
      .then((r) => r.json())
      .then(setSlots);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setModalOpen(false);
    loadSlots();
  }

  async function toggleAvailability(slot: Slot) {
    await fetch(`/api/slots/${slot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !slot.isAvailable }),
    });
    loadSlots();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este horário?")) return;
    await fetch(`/api/slots/${id}`, { method: "DELETE" });
    loadSlots();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">Horários Particulares</h1>
        <Button onClick={() => setModalOpen(true)}>Novo Horário</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 px-2 text-zinc-400">Dia</th>
                <th className="text-left py-2 px-2 text-zinc-400">Início</th>
                <th className="text-left py-2 px-2 text-zinc-400">Fim</th>
                <th className="text-left py-2 px-2 text-zinc-400">Status</th>
                <th className="text-left py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                  <td className="py-2 px-2 text-zinc-50">{DAY_NAMES[slot.dayOfWeek]}</td>
                  <td className="py-2 px-2 text-zinc-50">{slot.startTime}</td>
                  <td className="py-2 px-2 text-zinc-50">{slot.endTime}</td>
                  <td className="py-2 px-2">
                    <button onClick={() => toggleAvailability(slot)}>
                      <Badge
                        variant={slot.isAvailable ? "success" : "danger"}
                      >
                        {slot.isAvailable ? "Disponível" : "Indisponível"}
                      </Badge>
                    </button>
                  </td>
                  <td className="py-2 px-2">
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {slots.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    Nenhum horário cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Horário"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Dia da Semana"
            value={String(form.dayOfWeek)}
            onChange={(e) =>
              setForm({ ...form, dayOfWeek: Number(e.target.value) })
            }
          >
            {DAY_NAMES.map((name, i) => (
              <option key={i} value={i}>
                {name}
              </option>
            ))}
          </Select>
          <Input
            label="Início"
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            required
          />
          <Input
            label="Fim"
            type="time"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            required
          />
          <Button type="submit" className="w-full">
            Criar
          </Button>
        </form>
      </Modal>
    </div>
  );
}
