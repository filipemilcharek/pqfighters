"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { TimeInput } from "@/components/ui/time-input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { DAY_NAMES } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface Student {
  id: string;
  name: string;
}

interface Slot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  userId: string | null;
  user: { id: string; name: string } | null;
}

export default function SlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "09:00",
    userId: "",
  });

  useEffect(() => {
    loadSlots();
    fetch("/api/students")
      .then((r) => r.json())
      .then(setStudents);
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
      body: JSON.stringify({ ...form, userId: form.userId || null }),
    });
    setModalOpen(false);
    setForm({ dayOfWeek: 1, startTime: "08:00", endTime: "09:00", userId: "" });
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
                <th className="text-left py-2 px-2 text-zinc-400">Aluno</th>
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
                  <td className="py-2 px-2 text-zinc-50">{slot.user?.name ?? <span className="text-zinc-500">Aberto</span>}</td>
                  <td className="py-2 px-2">
                    <button onClick={() => toggleAvailability(slot)}>
                      <Badge
                        variant={slot.isAvailable ? "success" : "danger"}
                      >
                        {slot.isAvailable ? "Ativo" : "Inativo"}
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
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
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
            label="Aluno"
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
          >
            <option value="">Aberto (qualquer particular)</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
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
          <TimeInput
            label="Início"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            required
          />
          <TimeInput
            label="Fim"
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
