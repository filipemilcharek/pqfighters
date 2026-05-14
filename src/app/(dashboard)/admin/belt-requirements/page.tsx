"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BeltIcon } from "@/components/belt-icon";

const PROMOTION_BELTS = ["AZUL", "ROXA", "MARROM", "PRETA"];
const ALL_BELTS = ["BRANCA", "AZUL", "ROXA", "MARROM", "PRETA"];
const DEGREES = [1, 2, 3, 4];

interface Requirement {
  belt: string;
  requiredClasses: number;
}

interface DegreeRequirement {
  belt: string;
  degree: number;
  requiredClasses: number;
}

export default function BeltRequirementsPage() {
  const [requirements, setRequirements] = useState<Record<string, number>>({
    AZUL: 0, ROXA: 0, MARROM: 0, PRETA: 0,
  });
  const [degreeReqs, setDegreeReqs] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/belt-requirements")
      .then((r) => r.json())
      .then((data: Requirement[]) => {
        const map: Record<string, number> = { AZUL: 0, ROXA: 0, MARROM: 0, PRETA: 0 };
        data.forEach((r) => { map[r.belt] = r.requiredClasses; });
        setRequirements(map);
      });

    fetch("/api/belt-requirements?type=degree")
      .then((r) => r.json())
      .then((data: DegreeRequirement[]) => {
        const map: Record<string, number> = {};
        data.forEach((r) => { map[`${r.belt}-${r.degree}`] = r.requiredClasses; });
        setDegreeReqs(map);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const beltBody = PROMOTION_BELTS.map((belt) => ({
      belt,
      requiredClasses: requirements[belt] || 0,
    }));

    const degreeBody: { belt: string; degree: number; requiredClasses: number }[] = [];
    ALL_BELTS.forEach((belt) => {
      DEGREES.forEach((degree) => {
        const key = `${belt}-${degree}`;
        if (degreeReqs[key] !== undefined && degreeReqs[key] > 0) {
          degreeBody.push({ belt, degree, requiredClasses: degreeReqs[key] });
        }
      });
    });

    await Promise.all([
      fetch("/api/belt-requirements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(beltBody),
      }),
      degreeBody.length > 0
        ? fetch("/api/belt-requirements?type=degree", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(degreeBody),
          })
        : Promise.resolve(),
    ]);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const beltLabels: Record<string, string> = {
    AZUL: "Branca → Azul",
    ROXA: "Azul → Roxa",
    MARROM: "Roxa → Marrom",
    PRETA: "Marrom → Preta",
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-50 mb-2">Requisitos de Graduação</h1>
      <p className="text-sm text-zinc-400 mb-6">
        Configure a quantidade de aulas necessárias para avançar de faixa e de grau.
      </p>

      <form onSubmit={handleSave}>
        {/* Belt requirements */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-zinc-50 mb-4">Requisitos por Faixa</h2>
          <div className="space-y-5">
            {PROMOTION_BELTS.map((belt) => (
              <div key={belt} className="flex items-center gap-4">
                <BeltIcon belt={belt} size={24} />
                <div className="flex-1">
                  <Input
                    label={beltLabels[belt]}
                    type="number"
                    min="0"
                    value={String(requirements[belt] || "")}
                    onChange={(e) =>
                      setRequirements({
                        ...requirements,
                        [belt]: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="Ex: 50"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Degree requirements */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-zinc-50 mb-4">Requisitos por Grau</h2>
          <p className="text-xs text-zinc-400 mb-4">
            Aulas necessárias para cada grau dentro de cada faixa.
          </p>
          <div className="space-y-6">
            {ALL_BELTS.map((belt) => (
              <div key={belt}>
                <div className="flex items-center gap-2 mb-3">
                  <BeltIcon belt={belt} size={20} />
                  <span className="text-sm font-medium text-zinc-300">{belt}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DEGREES.map((degree) => {
                    const key = `${belt}-${degree}`;
                    return (
                      <Input
                        key={key}
                        label={`${degree}° grau`}
                        type="number"
                        min="0"
                        value={String(degreeReqs[key] || "")}
                        onChange={(e) =>
                          setDegreeReqs({
                            ...degreeReqs,
                            [key]: Number(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          {saved && (
            <span className="text-sm text-orange-500">Salvo com sucesso!</span>
          )}
        </div>
      </form>
    </div>
  );
}
