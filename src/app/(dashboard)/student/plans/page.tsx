"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Clock, Sparkles, Star, Crown, LucideIcon } from "lucide-react";

interface PlanOption {
  id: string;
  frequency: string;
  details: string | null;
  label: string;
  price: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  iconHint: string;
  color: string;
  isKids: boolean;
  options: PlanOption[];
}

const iconMap: Record<string, LucideIcon> = { Star, Sparkles, Crown };

const colorMap: Record<string, { card: string; badge: string; icon: string; selected: string }> = {
  orange: {
    card: "border-orange-500/30 hover:border-orange-500/60",
    badge: "bg-orange-500/10 text-orange-400",
    icon: "text-orange-400",
    selected: "border-orange-500 bg-orange-500/5",
  },
  blue: {
    card: "border-blue-500/30 hover:border-blue-500/60",
    badge: "bg-blue-500/10 text-blue-400",
    icon: "text-blue-400",
    selected: "border-blue-500 bg-blue-500/5",
  },
  amber: {
    card: "border-amber-500/30 hover:border-amber-500/60",
    badge: "bg-amber-500/10 text-amber-400",
    icon: "text-amber-400",
    selected: "border-amber-500 bg-amber-500/5",
  },
};

export default function StudentPlansPage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [upgradeError, setUpgradeError] = useState("");
  const [pendingRequest, setPendingRequest] = useState<{ plan: string; frequency: string; price: string } | null>(null);

  useEffect(() => {
    fetch("/api/plans").then((r) => r.json()).then(setPlans);
    fetch("/api/plan-upgrade/my-request")
      .then((r) => r.json())
      .then((data) => { if (data?.id) setPendingRequest(data); })
      .catch(() => {});
  }, []);

  const isKids = session?.user.isKids;
  const availablePlans = plans.filter((p) => p.isKids === !!isKids);

  const selectedPlanData = availablePlans.find((p) => p.id === selectedPlan);

  // Auto-select for single-option plans
  useEffect(() => {
    if (!selectedPlanData) return;
    if (selectedPlanData.options.length === 1) setSelectedOptionIdx(0);
  }, [selectedPlanData]);

  async function handleSubmitUpgrade() {
    if (!selectedPlanData || selectedOptionIdx === null) return;
    setSubmitting(true);
    setUpgradeError("");

    const option = selectedPlanData.options[selectedOptionIdx];

    const res = await fetch("/api/plan-upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan: selectedPlanData.name,
        frequency: option.frequency,
        details: option.details || null,
        price: option.price,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setUpgradeError(data.error || "Erro ao enviar solicitação");
      return;
    }

    setUpgradeSuccess(true);
    setPendingRequest({ plan: selectedPlanData.name, frequency: option.frequency, price: option.price });
    setSelectedPlan(null);
    setSelectedOptionIdx(null);
  }

  if (!session) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-zinc-50">Planos</h1>

      {pendingRequest && (
        <Card className="mb-4 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-zinc-50">
                Solicitação pendente: Plano {pendingRequest.plan}
              </p>
              <p className="text-xs text-zinc-400">
                {pendingRequest.price} - Aguardando aprovação do professor
              </p>
            </div>
          </div>
        </Card>
      )}

      {upgradeSuccess && !pendingRequest && (
        <Card className="mb-4 border-l-4 border-l-emerald-500">
          <p className="text-sm text-emerald-400">
            Solicitação enviada com sucesso! O professor irá analisar em breve.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {availablePlans.map((plan) => {
          const Icon = iconMap[plan.iconHint] || Star;
          const colors = colorMap[plan.color] || colorMap.orange;
          const isSelected = selectedPlan === plan.id;

          return (
            <button
              key={plan.id}
              onClick={() => {
                setSelectedPlan(isSelected ? null : plan.id);
                setSelectedOptionIdx(null);
                setUpgradeError("");
                setUpgradeSuccess(false);
              }}
              disabled={!!pendingRequest}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected ? colors.selected : `border-zinc-800 ${!pendingRequest ? colors.card : ""}`
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={20} className={colors.icon} />
                <span className="font-bold text-zinc-50">{plan.name}</span>
              </div>
              <p className="text-xs text-zinc-400">{plan.description}</p>
              {plan.options.length > 1 && (
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
                    {plan.options.length} opções
                  </span>
                  <ChevronRight size={14} className={`text-zinc-600 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                </div>
              )}
              {plan.options.length === 1 && (
                <p className="text-sm font-bold text-zinc-50 mt-3">{plan.options[0].price}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Options for selected plan (multi-option) */}
      {selectedPlanData && selectedPlanData.options.length > 1 && (
        <Card className="mt-4">
          <h3 className="text-sm font-semibold text-zinc-50 mb-3">
            Escolha a frequência - {selectedPlanData.name}
          </h3>
          <div className="space-y-2">
            {selectedPlanData.options.map((option, i) => {
              const isOptionSelected = selectedOptionIdx === i;
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    setSelectedOptionIdx(isOptionSelected ? null : i);
                    setUpgradeError("");
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                    isOptionSelected
                      ? "border-orange-500 bg-orange-500/5"
                      : "border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isOptionSelected ? "border-orange-500 bg-orange-500" : "border-zinc-600"
                    }`}>
                      {isOptionSelected && <Check size={10} className="text-white" />}
                    </div>
                    <span className="text-sm text-zinc-50">{option.label}</span>
                  </div>
                  <span className="text-sm font-bold text-zinc-50">{option.price}</span>
                </button>
              );
            })}
          </div>

          {upgradeError && (
            <p className="text-sm text-red-400 mt-3">{upgradeError}</p>
          )}

          <Button
            className="w-full mt-4"
            disabled={selectedOptionIdx === null || submitting}
            onClick={handleSubmitUpgrade}
          >
            {submitting ? "Enviando..." : "Solicitar Plano"}
          </Button>
        </Card>
      )}

      {/* Submit for single-option plans */}
      {selectedPlanData && selectedPlanData.options.length === 1 && (
        <div className="mt-4">
          {upgradeError && (
            <p className="text-sm text-red-400 mb-3">{upgradeError}</p>
          )}
          <Button
            className="w-full"
            disabled={submitting}
            onClick={handleSubmitUpgrade}
          >
            {submitting ? "Enviando..." : "Solicitar Plano"}
          </Button>
        </div>
      )}
    </div>
  );
}
