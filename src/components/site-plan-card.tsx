"use client";

import { useState } from "react";
import { Star, Sparkles, Crown, ChevronDown, type LucideIcon } from "lucide-react";

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

const colorMap: Record<string, { border: string; icon: string; cat: string }> = {
  orange: { border: "border-orange-500/30 hover:border-orange-500/60", icon: "text-orange-400", cat: "text-orange-400" },
  blue: { border: "border-blue-500/30 hover:border-blue-500/60", icon: "text-blue-400", cat: "text-blue-400" },
  amber: { border: "border-amber-500/30 hover:border-amber-500/60", icon: "text-amber-400", cat: "text-amber-400" },
};

const categoryLabels: Record<string, string> = {
  avulsa: "Avulsa / Pacotes",
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

function groupByFrequency(options: PlanOption[]) {
  const groups: Record<string, PlanOption[]> = {};
  for (const opt of options) {
    const key = opt.frequency;
    if (!groups[key]) groups[key] = [];
    groups[key].push(opt);
  }
  return groups;
}

export function SitePlanCard({ plan, kidsPrefix }: { plan: Plan; kidsPrefix?: boolean }) {
  const Icon = iconMap[plan.iconHint] || Star;
  const colors = colorMap[plan.color] || colorMap.orange;
  const hasMany = plan.options.length > 5;
  const groups = hasMany ? groupByFrequency(plan.options) : null;
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  return (
    <div className={`border-2 rounded-xl p-6 transition-colors ${colors.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={22} className={colors.icon} />
        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
      </div>
      <p className="text-sm text-zinc-400 mb-4">{plan.description}</p>

      {!hasMany && (
        <div className="space-y-2">
          {plan.options.map((opt) => (
            <OptionLink key={opt.id} plan={plan} opt={opt} kidsPrefix={kidsPrefix} />
          ))}
        </div>
      )}

      {hasMany && groups && (
        <div className="space-y-2">
          {Object.entries(groups).map(([freq, opts]) => {
            const isOpen = expandedCat === freq;
            return (
              <div key={freq}>
                <button
                  onClick={() => setExpandedCat(isOpen ? null : freq)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-white/5 hover:border-accent/30 transition-colors"
                >
                  <span className={`text-sm font-medium ${colors.cat}`}>
                    {categoryLabels[freq] || freq}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {opts.length} {opts.length === 1 ? "opcao" : "opcoes"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>
                {isOpen && (
                  <div className="mt-1 ml-3 space-y-1">
                    {opts.map((opt) => (
                      <OptionLink key={opt.id} plan={plan} opt={opt} kidsPrefix={kidsPrefix} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OptionLink({ plan, opt, kidsPrefix }: { plan: Plan; opt: PlanOption; kidsPrefix?: boolean }) {
  const prefix = kidsPrefix ? "Kids " : "";
  const msg = encodeURIComponent(
    `Ola, tenho interesse no plano ${prefix}${plan.name} - ${opt.label} (${opt.price})`
  );
  return (
    <a
      href={`https://wa.me/5551985092214?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:border-accent/30 hover:bg-white/[0.02] transition-colors group"
    >
      <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
        {opt.label}
      </span>
      <span className="text-sm font-bold text-white">{opt.price}</span>
    </a>
  );
}
