"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentAvatar } from "@/components/student-avatar";
import { Check, X, ArrowUpCircle } from "lucide-react";
import { getPlanLabel } from "@/lib/utils";

interface UpgradeRequest {
  id: string;
  plan: string;
  frequency: string;
  details: string | null;
  price: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    photoUrl: string | null;
    studentType: string;
  };
}

function formatDetails(details: string | null): string {
  if (!details) return "";
  return details
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PlanUpgradesPage() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plan-upgrade")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRequests(data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleApprove(id: string) {
    setActionId(id);
    const res = await fetch(`/api/plan-upgrade/${id}`, { method: "PATCH" });
    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    }
    setActionId(null);
  }

  async function handleReject(id: string) {
    if (!confirm("Rejeitar esta solicitação de plano?")) return;
    setActionId(id);
    const res = await fetch(`/api/plan-upgrade/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    }
    setActionId(null);
  }

  if (loading) {
    return <div className="text-center py-8 text-zinc-500">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ArrowUpCircle size={28} className="text-blue-400" />
        <h1 className="text-2xl font-bold text-zinc-50">Solicitações de Plano</h1>
      </div>

      {requests.length === 0 ? (
        <Card className="!p-8">
          <p className="text-zinc-400 text-sm text-center">
            Nenhuma solicitação de plano pendente.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id} className="!p-4 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-4">
                <StudentAvatar name={r.user.name} photoUrl={r.user.photoUrl} size={48} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-50 truncate">{r.user.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{r.user.email}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="default">
                      Atual: {getPlanLabel(r.user.studentType)}
                    </Badge>
                    <Badge variant="success">
                      Plano {r.plan}
                    </Badge>
                    <span className="text-xs text-zinc-400">
                      {r.frequency}{r.details ? ` - ${formatDetails(r.details)}` : ""}
                    </span>
                    <span className="text-sm font-bold text-zinc-50">{r.price}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Solicitado em {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    disabled={actionId !== null}
                    onClick={() => handleApprove(r.id)}
                  >
                    <Check size={14} className="mr-1.5" />
                    Aprovar
                  </Button>
                  <button
                    disabled={actionId !== null}
                    onClick={() => handleReject(r.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Rejeitar"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
