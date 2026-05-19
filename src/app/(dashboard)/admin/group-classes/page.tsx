"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TimeInput } from "@/components/ui/time-input";
import { Modal } from "@/components/ui/modal";
import { DAY_NAMES } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface GroupClass {
  id: string;
  name: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity: number;
}

export default function GroupClassesPage() {
  const [classes, setClasses] = useState<GroupClass[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "09:00",
    capacity: 20,
  });

  useEffect(() => {
    loadClasses();
  }, []);

  function loadClasses() {
    fetch("/api/group-classes")
      .then((r) => r.json())
      .then(setClasses);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/group-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setModalOpen(false);
    setForm({ name: "", dayOfWeek: 1, startTime: "08:00", endTime: "09:00", capacity: 20 });
    loadClasses();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta aula?")) return;
    await fetch(`/api/group-classes/${id}`, { method: "DELETE" });
    loadClasses();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">Aulas Coletivas</h1>
        <Button onClick={() => setModalOpen(true)}>Nova Aula</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 px-2 text-zinc-400">Nome</th>
                <th className="text-left py-2 px-2 text-zinc-400">Dia</th>
                <th className="text-left py-2 px-2 text-zinc-400">Horário</th>
                <th className="text-left py-2 px-2 text-zinc-400">Capacidade</th>
                <th className="text-left py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {classes.map((gc) => (
                <tr key={gc.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                  <td className="py-2 px-2 font-medium text-zinc-50">{gc.name}</td>
                  <td className="py-2 px-2 text-zinc-50">{DAY_NAMES[gc.dayOfWeek]}</td>
                  <td className="py-2 px-2 text-zinc-50">
                    {gc.startTime} - {gc.endTime}
                  </td>
                  <td className="py-2 px-2 text-zinc-50">{gc.capacity} alunos</td>
                  <td className="py-2 px-2">
                    <button
                      onClick={() => handleDelete(gc.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    Nenhuma aula cadastrada
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
        title="Nova Aula Coletiva"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
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
          <Input
            label="Capacidade"
            type="number"
            min="1"
            value={String(form.capacity)}
            onChange={(e) =>
              setForm({ ...form, capacity: Number(e.target.value) })
            }
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
