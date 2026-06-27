"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";

interface Professor {
  id: string;
  name: string;
  email: string;
  isOwner: boolean;
  _count: { instructorClasses: number; instructorSlots: number };
}

const emptyForm = { name: "", email: "", password: "" };

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadProfessors();
  }, []);

  function loadProfessors() {
    fetch("/api/professors")
      .then((r) => r.json())
      .then(setProfessors);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/professors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erro ao criar professor");
      return;
    }
    setCreateModalOpen(false);
    setForm(emptyForm);
    loadProfessors();
  }

  function openEdit(p: Professor) {
    setEditingId(p.id);
    setForm({ name: p.name, email: p.email, password: "" });
    setEditModalOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const body: Record<string, string> = { name: form.name, email: form.email };
    if (form.password) body.password = form.password;
    const res = await fetch(`/api/professors/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erro ao editar professor");
      return;
    }
    setEditModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    loadProfessors();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este professor?")) return;
    const res = await fetch(`/api/professors/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erro ao excluir");
      return;
    }
    loadProfessors();
  }

  const formFields = (isEdit: boolean) => (
    <>
      <Input
        label="Nome"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <Input
        label={isEdit ? "Nova Senha (deixe vazio para manter)" : "Senha"}
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required={!isEdit}
      />
    </>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">Professores</h1>
        <Button onClick={() => { setForm(emptyForm); setCreateModalOpen(true); }}>
          Novo Professor
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 px-2 text-zinc-400">Nome</th>
                <th className="text-left py-2 px-2 text-zinc-400">Email</th>
                <th className="text-left py-2 px-2 text-zinc-400">Aulas</th>
                <th className="text-left py-2 px-2 text-zinc-400">Tipo</th>
                <th className="text-left py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {professors.map((p) => (
                <tr key={p.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                  <td className="py-2 px-2 font-medium text-zinc-50">{p.name}</td>
                  <td className="py-2 px-2 text-zinc-400">{p.email}</td>
                  <td className="py-2 px-2 text-zinc-50">
                    {p._count.instructorClasses + p._count.instructorSlots}
                  </td>
                  <td className="py-2 px-2">
                    <Badge variant={p.isOwner ? "success" : "default"}>
                      {p.isOwner ? "Dono" : "Professor"}
                    </Badge>
                  </td>
                  <td className="py-2 px-2">
                    {!p.isOwner && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-zinc-400 hover:text-zinc-200"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {professors.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    Nenhum professor cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Novo Professor"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formFields(false)}
          <Button type="submit" className="w-full">Criar</Button>
        </form>
      </Modal>

      <Modal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingId(null); }}
        title="Editar Professor"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          {formFields(true)}
          <Button type="submit" className="w-full">Salvar</Button>
        </form>
      </Modal>
    </div>
  );
}
