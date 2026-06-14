"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Trash2, Pencil, Plus, ChevronDown, ChevronUp } from "lucide-react";

interface PlanOptionData {
  id: string;
  frequency: string;
  details: string | null;
  label: string;
  price: string;
  sortOrder: number;
}

interface PlanData {
  id: string;
  name: string;
  description: string;
  iconHint: string;
  color: string;
  isKids: boolean;
  isActive: boolean;
  sortOrder: number;
  options: PlanOptionData[];
}

const emptyPlanForm = {
  name: "",
  description: "",
  iconHint: "Star",
  color: "orange",
  isKids: false,
  sortOrder: 0,
};

const emptyOptionForm = {
  frequency: "",
  details: "",
  label: "",
  price: "",
  sortOrder: 0,
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editPlanModalOpen, setEditPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState(emptyPlanForm);

  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [editOptionModalOpen, setEditOptionModalOpen] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [optionPlanId, setOptionPlanId] = useState<string | null>(null);
  const [optionForm, setOptionForm] = useState(emptyOptionForm);

  useEffect(() => { loadPlans(); }, []);

  function loadPlans() {
    fetch("/api/admin/plans").then((r) => r.json()).then(setPlans);
  }

  async function handleCreatePlan(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(planForm),
    });
    setPlanModalOpen(false);
    setPlanForm(emptyPlanForm);
    loadPlans();
  }

  function openEditPlan(plan: PlanData) {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      iconHint: plan.iconHint,
      color: plan.color,
      isKids: plan.isKids,
      sortOrder: plan.sortOrder,
    });
    setEditPlanModalOpen(true);
  }

  async function handleEditPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPlanId) return;
    await fetch(`/api/admin/plans/${editingPlanId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(planForm),
    });
    setEditPlanModalOpen(false);
    setEditingPlanId(null);
    setPlanForm(emptyPlanForm);
    loadPlans();
  }

  async function handleDeletePlan(id: string) {
    if (!confirm("Excluir este plano e todas suas opções?")) return;
    await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
    loadPlans();
  }

  async function handleToggleActive(plan: PlanData) {
    await fetch(`/api/admin/plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !plan.isActive }),
    });
    loadPlans();
  }

  function openAddOption(planId: string) {
    setOptionPlanId(planId);
    setOptionForm(emptyOptionForm);
    setOptionModalOpen(true);
  }

  async function handleCreateOption(e: React.FormEvent) {
    e.preventDefault();
    if (!optionPlanId) return;
    await fetch(`/api/admin/plans/${optionPlanId}/options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(optionForm),
    });
    setOptionModalOpen(false);
    setOptionForm(emptyOptionForm);
    loadPlans();
  }

  function openEditOption(planId: string, option: PlanOptionData) {
    setOptionPlanId(planId);
    setEditingOptionId(option.id);
    setOptionForm({
      frequency: option.frequency,
      details: option.details || "",
      label: option.label,
      price: option.price,
      sortOrder: option.sortOrder,
    });
    setEditOptionModalOpen(true);
  }

  async function handleEditOption(e: React.FormEvent) {
    e.preventDefault();
    if (!optionPlanId || !editingOptionId) return;
    await fetch(`/api/admin/plans/${optionPlanId}/options/${editingOptionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(optionForm),
    });
    setEditOptionModalOpen(false);
    setEditingOptionId(null);
    setOptionForm(emptyOptionForm);
    loadPlans();
  }

  async function handleDeleteOption(planId: string, optionId: string) {
    if (!confirm("Excluir esta opção?")) return;
    await fetch(`/api/admin/plans/${planId}/options/${optionId}`, { method: "DELETE" });
    loadPlans();
  }

  const planFormFields = (
    <>
      <Input
        label="Nome"
        value={planForm.name}
        onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
        required
      />
      <Input
        label="Descrição"
        value={planForm.description}
        onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
      />
      <Select
        label="Ícone"
        value={planForm.iconHint}
        onChange={(e) => setPlanForm({ ...planForm, iconHint: e.target.value })}
      >
        <option value="Star">Estrela</option>
        <option value="Sparkles">Brilho</option>
        <option value="Crown">Coroa</option>
      </Select>
      <Select
        label="Cor do card"
        value={planForm.color}
        onChange={(e) => setPlanForm({ ...planForm, color: e.target.value })}
      >
        <option value="orange">Laranja</option>
        <option value="blue">Azul</option>
        <option value="amber">Âmbar</option>
      </Select>
      <Input
        label="Posição na lista (menor aparece primeiro)"
        type="number"
        value={String(planForm.sortOrder)}
        onChange={(e) => setPlanForm({ ...planForm, sortOrder: Number(e.target.value) })}
      />
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={planForm.isKids}
          onChange={(e) => setPlanForm({ ...planForm, isKids: e.target.checked })}
          className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-orange-500 focus:ring-orange-500"
        />
        <span className="text-sm text-zinc-200">Plano Kids</span>
      </label>
    </>
  );

  const optionFormFields = (
    <>
      <Input
        label="Label"
        value={optionForm.label}
        onChange={(e) => setOptionForm({ ...optionForm, label: e.target.value })}
        required
      />
      <Input
        label="Frequência"
        value={optionForm.frequency}
        onChange={(e) => setOptionForm({ ...optionForm, frequency: e.target.value })}
        placeholder="mensal, trimestral, avulsa..."
        required
      />
      <Input
        label="Detalhes (opcional)"
        value={optionForm.details}
        onChange={(e) => setOptionForm({ ...optionForm, details: e.target.value })}
        placeholder="1x_semana, pacote_5_aulas..."
      />
      <Input
        label="Preço"
        value={optionForm.price}
        onChange={(e) => setOptionForm({ ...optionForm, price: e.target.value })}
        placeholder="R$229,00"
        required
      />
      <Input
        label="Ordem"
        type="number"
        value={String(optionForm.sortOrder)}
        onChange={(e) => setOptionForm({ ...optionForm, sortOrder: Number(e.target.value) })}
      />
    </>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">Planos</h1>
        <Button onClick={() => { setPlanForm(emptyPlanForm); setPlanModalOpen(true); }}>
          Novo Plano
        </Button>
      </div>

      <div className="space-y-4">
        {plans.map((plan) => {
          const isExpanded = expandedPlan === plan.id;
          return (
            <Card key={plan.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-50">{plan.name}</span>
                      {plan.isKids && <Badge variant="warning">Kids</Badge>}
                      {!plan.isActive && <Badge variant="default">Inativo</Badge>}
                    </div>
                    <p className="text-sm text-zinc-400">{plan.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`text-xs px-2 py-1 rounded ${plan.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}
                  >
                    {plan.isActive ? "Ativo" : "Inativo"}
                  </button>
                  <button onClick={() => openEditPlan(plan)} className="text-zinc-400 hover:text-zinc-200">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDeletePlan(plan.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 border-t border-zinc-800 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-zinc-300">Opções ({plan.options.length})</span>
                    <button
                      onClick={() => openAddOption(plan.id)}
                      className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300"
                    >
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>
                  {plan.options.length === 0 ? (
                    <p className="text-sm text-zinc-500">Nenhuma opção cadastrada</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-zinc-800">
                            <th className="text-left py-2 px-2 text-zinc-400">Label</th>
                            <th className="text-left py-2 px-2 text-zinc-400">Frequência</th>
                            <th className="text-left py-2 px-2 text-zinc-400">Detalhes</th>
                            <th className="text-left py-2 px-2 text-zinc-400">Preço</th>
                            <th className="text-left py-2 px-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {plan.options.map((opt) => (
                            <tr key={opt.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                              <td className="py-2 px-2 text-zinc-50">{opt.label}</td>
                              <td className="py-2 px-2 text-zinc-50">{opt.frequency}</td>
                              <td className="py-2 px-2 text-zinc-400">{opt.details || "—"}</td>
                              <td className="py-2 px-2 text-zinc-50 font-medium">{opt.price}</td>
                              <td className="py-2 px-2">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => openEditOption(plan.id, opt)} className="text-zinc-400 hover:text-zinc-200">
                                    <Pencil size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteOption(plan.id, opt.id)} className="text-red-400 hover:text-red-300">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
        {plans.length === 0 && (
          <Card>
            <p className="text-center text-zinc-500 py-8">Nenhum plano cadastrado</p>
          </Card>
        )}
      </div>

      {/* Create Plan Modal */}
      <Modal open={planModalOpen} onClose={() => setPlanModalOpen(false)} title="Novo Plano">
        <form onSubmit={handleCreatePlan} className="space-y-4">
          {planFormFields}
          <Button type="submit" className="w-full">Criar</Button>
        </form>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal open={editPlanModalOpen} onClose={() => { setEditPlanModalOpen(false); setEditingPlanId(null); }} title="Editar Plano">
        <form onSubmit={handleEditPlan} className="space-y-4">
          {planFormFields}
          <Button type="submit" className="w-full">Salvar</Button>
        </form>
      </Modal>

      {/* Create Option Modal */}
      <Modal open={optionModalOpen} onClose={() => setOptionModalOpen(false)} title="Nova Opção">
        <form onSubmit={handleCreateOption} className="space-y-4">
          {optionFormFields}
          <Button type="submit" className="w-full">Criar</Button>
        </form>
      </Modal>

      {/* Edit Option Modal */}
      <Modal open={editOptionModalOpen} onClose={() => { setEditOptionModalOpen(false); setEditingOptionId(null); }} title="Editar Opção">
        <form onSubmit={handleEditOption} className="space-y-4">
          {optionFormFields}
          <Button type="submit" className="w-full">Salvar</Button>
        </form>
      </Modal>
    </div>
  );
}
