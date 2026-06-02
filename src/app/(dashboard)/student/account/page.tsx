"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudentAvatar } from "@/components/student-avatar";
import { Check, ChevronRight, Clock, Sparkles, Star, Crown, LucideIcon } from "lucide-react";

interface PlanOption {
  frequency: string;
  details?: string;
  label: string;
  price: string;
}

interface PlanDef {
  icon: LucideIcon;
  color: string;
  description: string;
  options: PlanOption[];
}

const PLANS: Record<string, PlanDef> = {
  Essencial: {
    icon: Star,
    color: "orange",
    description: "Aulas coletivas",
    options: [
      { frequency: "mensal", label: "Mensal", price: "R$229,00" },
      { frequency: "trimestral", label: "Trimestral", price: "R$619,00" },
      { frequency: "semestral", label: "Semestral", price: "R$1.168,00" },
      { frequency: "anual", label: "Anual", price: "R$2.199,00" },
    ],
  },
  Pro: {
    icon: Sparkles,
    color: "blue",
    description: "Semi-particular (max 4 alunos)",
    options: [
      { frequency: "mensal", label: "Mensal", price: "R$289,00" },
      { frequency: "trimestral", label: "Trimestral", price: "R$780,00" },
      { frequency: "semestral", label: "Semestral", price: "R$1.480,00" },
      { frequency: "anual", label: "Anual", price: "R$2.790,00" },
    ],
  },
  Premium: {
    icon: Crown,
    color: "amber",
    description: "Aulas particulares exclusivas",
    options: [
      { frequency: "avulsa", details: "aula_avulsa", label: "Aula avulsa", price: "R$120,00" },
      { frequency: "avulsa", details: "pacote_5_aulas", label: "Pacote 5 aulas", price: "R$540,00" },
      { frequency: "avulsa", details: "pacote_10_aulas", label: "Pacote 10 aulas", price: "R$990,00" },
      { frequency: "mensal", details: "1x_semana", label: "Mensal - 1x semana", price: "R$420,00" },
      { frequency: "mensal", details: "2x_semana", label: "Mensal - 2x semana", price: "R$690,00" },
      { frequency: "mensal", details: "3x_semana", label: "Mensal - 3x semana", price: "R$990,00" },
      { frequency: "trimestral", details: "1x_semana", label: "Trimestral - 1x semana", price: "R$1.140,00" },
      { frequency: "trimestral", details: "2x_semana", label: "Trimestral - 2x semana", price: "R$1.890,00" },
      { frequency: "trimestral", details: "3x_semana", label: "Trimestral - 3x semana", price: "R$2.430,00" },
      { frequency: "semestral", details: "1x_semana", label: "Semestral - 1x semana", price: "R$2.160,00" },
      { frequency: "semestral", details: "2x_semana", label: "Semestral - 2x semana", price: "R$3.570,00" },
      { frequency: "semestral", details: "3x_semana", label: "Semestral - 3x semana", price: "R$4.590,00" },
      { frequency: "anual", details: "1x_semana", label: "Anual - 1x semana", price: "R$4.080,00" },
      { frequency: "anual", details: "2x_semana", label: "Anual - 2x semana", price: "R$6.720,00" },
      { frequency: "anual", details: "3x_semana", label: "Anual - 3x semana", price: "R$8.640,00" },
    ],
  },
};

const KIDS_PLANS: Record<string, PlanDef> = {
  "Boxe": {
    icon: Star,
    color: "orange",
    description: "Boxe Kids",
    options: [
      { frequency: "mensal", details: "boxe", label: "Mensal", price: "R$200,00" },
    ],
  },
  "Jiu-Jitsu + No-Gi": {
    icon: Sparkles,
    color: "blue",
    description: "Plano Único (Jiu-Jitsu + No-Gi)",
    options: [
      { frequency: "mensal", details: "jiu_jitsu_nogi", label: "Mensal", price: "R$220,00" },
    ],
  },
  "Jiu-Jitsu + Boxe": {
    icon: Crown,
    color: "amber",
    description: "Jiu-Jitsu + Boxe Kids",
    options: [
      { frequency: "mensal", details: "jiu_jitsu_e_boxe", label: "Mensal", price: "R$250,00" },
    ],
  },
};

const ALL_PLANS: Record<string, PlanDef> = { ...PLANS, ...KIDS_PLANS };

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

export default function AccountPage() {
  const { data: session, update } = useSession();
  const [photoUrl, setPhotoUrl] = useState<string | null>(session?.user.photoUrl ?? null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Plan upgrade state
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [upgradeError, setUpgradeError] = useState("");
  const [pendingRequest, setPendingRequest] = useState<{ plan: string; frequency: string; price: string } | null>(null);

  useEffect(() => {
    fetch("/api/plan-upgrade/my-request")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) setPendingRequest(data);
      })
      .catch(() => {});
  }, []);

  // Auto-select for single-option plans (Kids)
  useEffect(() => {
    if (!selectedPlan) return;
    const plan = ALL_PLANS[selectedPlan];
    if (plan?.options.length === 1) setSelectedOption(0);
  }, [selectedPlan]);

  if (!session) return null;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoSuccess(false);
    }
  }

  async function handleSavePhoto() {
    if (!photoFile) return;
    setSavingPhoto(true);

    const fd = new FormData();
    fd.append("file", photoFile);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
    if (!uploadRes.ok) {
      setSavingPhoto(false);
      return;
    }
    const { url } = await uploadRes.json();

    const res = await fetch("/api/student/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoUrl: url }),
    });

    if (res.ok) {
      setPhotoUrl(url);
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoSuccess(true);
      update();
    }
    setSavingPhoto(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("Nova senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return;
    }

    setSavingPassword(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    setSavingPassword(false);

    if (!res.ok) {
      setPasswordError(data.error || "Erro ao alterar senha");
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleSubmitUpgrade() {
    if (selectedPlan === null || selectedOption === null) return;
    setSubmitting(true);
    setUpgradeError("");

    const plan = ALL_PLANS[selectedPlan];
    const option = plan.options[selectedOption];

    const res = await fetch("/api/plan-upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan: selectedPlan,
        frequency: option.frequency,
        details: "details" in option ? option.details : null,
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
    setPendingRequest({ plan: selectedPlan, frequency: option.frequency, price: option.price });
    setSelectedPlan(null);
    setSelectedOption(null);
  }

  const displayPhoto = photoPreview || photoUrl;
  const isKids = session.user.isKids;
  const availablePlanNames = isKids
    ? Object.keys(KIDS_PLANS)
    : Object.keys(PLANS);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-zinc-50">Minha Conta</h1>

      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4 text-zinc-50">Foto de Perfil</h2>
        <div className="flex items-center gap-4 mb-4">
          <StudentAvatar name={session.user.name} photoUrl={displayPhoto} size={64} />
          <label className="cursor-pointer inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 px-3 py-1.5 text-sm bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700">
            {displayPhoto ? "Alterar foto" : "Adicionar foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </label>
        </div>
        {photoFile && (
          <Button size="sm" onClick={handleSavePhoto} disabled={savingPhoto}>
            {savingPhoto ? "Salvando..." : "Salvar foto"}
          </Button>
        )}
        {photoSuccess && (
          <p className="text-sm text-emerald-400 mt-2">Foto atualizada!</p>
        )}
      </Card>

      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4 text-zinc-50">Alterar Senha</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Senha atual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {passwordError && (
            <p className="text-sm text-red-400">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-sm text-emerald-400">Senha alterada com sucesso!</p>
          )}
          <Button type="submit" disabled={savingPassword}>
            {savingPassword ? "Alterando..." : "Alterar Senha"}
          </Button>
        </form>
      </Card>

      {/* Plan Upgrade Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 text-zinc-50">Planos</h2>

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
          {availablePlanNames.map((planName) => {
            const plan = ALL_PLANS[planName];
            const Icon = plan.icon;
            const colors = colorMap[plan.color];
            const isSelected = selectedPlan === planName;

            return (
              <button
                key={planName}
                onClick={() => {
                  setSelectedPlan(isSelected ? null : planName);
                  setSelectedOption(null);
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
                  <span className="font-bold text-zinc-50">{planName}</span>
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

        {/* Options for selected plan (multi-option only) */}
        {selectedPlan && (() => {
          return ALL_PLANS[selectedPlan]?.options.length > 1;
        })() && (
          <Card className="mt-4">
            <h3 className="text-sm font-semibold text-zinc-50 mb-3">
              Escolha a frequência - {selectedPlan}
            </h3>
            <div className="space-y-2">
              {(() => {
                return ALL_PLANS[selectedPlan!].options.map((option, i) => {
                const isOptionSelected = selectedOption === i;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedOption(isOptionSelected ? null : i);
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
              });
              })()}
            </div>

            {upgradeError && (
              <p className="text-sm text-red-400 mt-3">{upgradeError}</p>
            )}

            <Button
              className="w-full mt-4"
              disabled={selectedOption === null || submitting}
              onClick={handleSubmitUpgrade}
            >
              {submitting ? "Enviando..." : "Solicitar Plano"}
            </Button>
          </Card>
        )}

        {/* Submit button for single-option plans (Kids) */}
        {selectedPlan && (() => {
          return ALL_PLANS[selectedPlan]?.options.length === 1;
        })() && (
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
    </div>
  );
}
