"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { BeltIcon } from "@/components/belt-icon";
import { StudentAvatar } from "@/components/student-avatar";
import { CheckCircle, Users, TrendingUp, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

interface StudentAttendance {
  id: string;
  name: string;
  belt: string;
  degrees: number;
  photoUrl: string | null;
  checkins: number;
}

interface Summary {
  totalCheckins: number;
  totalBookings: number;
  activeStudents: number;
  avgPerStudent: number;
  topStudent: string;
  topStudentCheckins: number;
}

function getDateRange(period: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];

  if (period === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return { from: d.toISOString().split("T")[0], to };
  }
  if (period === "month") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return { from: d.toISOString().split("T")[0], to };
  }
  if (period === "3months") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 3);
    return { from: d.toISOString().split("T")[0], to };
  }
  return { from: to, to };
}

export default function AttendancePage() {
  const router = useRouter();
  const [period, setPeriod] = useState("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  function fetchData(from: string, to: string) {
    setLoading(true);
    fetch(`/api/attendance?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((data) => {
        setStudents(data.students || []);
        setSummary(data.summary || null);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (period === "custom") {
      if (customFrom && customTo) fetchData(customFrom, customTo);
      return;
    }
    const { from, to } = getDateRange(period);
    fetchData(from, to);
  }, [period, customFrom, customTo]);

  const sortedStudents = [...students].sort((a, b) => b.checkins - a.checkins);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-content-primary">Presenças</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        {[
          { value: "week", label: "Semana" },
          { value: "month", label: "Mês" },
          { value: "3months", label: "3 Meses" },
          { value: "custom", label: "Personalizado" },
        ].map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              period === p.value
                ? "bg-accent text-content-primary"
                : "bg-surface-tertiary text-content-secondary hover:bg-surface-tertiary"
            }`}
          >
            {p.label}
          </button>
        ))}

        {period === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="bg-surface-tertiary border border-border text-content-secondary rounded-md px-3 py-1.5 text-sm"
            />
            <span className="text-content-muted">até</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="bg-surface-tertiary border border-border text-content-secondary rounded-md px-3 py-1.5 text-sm"
            />
          </div>
        )}
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <CheckCircle size={22} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-content-secondary">Check-ins</p>
                <p className="text-2xl font-bold text-content-primary">{summary.totalCheckins}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <Users size={22} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-content-secondary">Alunos Ativos</p>
                <p className="text-2xl font-bold text-content-primary">{summary.activeStudents}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <TrendingUp size={22} className="text-accent" />
              </div>
              <div>
                <p className="text-sm text-content-secondary">Média por aluno</p>
                <p className="text-2xl font-bold text-content-primary">{summary.avgPerStudent}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Trophy size={22} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-content-secondary">Mais frequente</p>
                <p className="text-lg font-bold text-content-primary truncate">{summary.topStudent}</p>
                <p className="text-xs text-content-muted">{summary.topStudentCheckins} check-ins</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Students table */}
      <Card>
        <h2 className="text-lg font-semibold mb-4 text-content-primary">Alunos</h2>
        {loading ? (
          <div className="text-center py-8 text-content-muted">Carregando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 text-content-secondary font-medium">#</th>
                  <th className="text-left py-3 px-3 text-content-secondary font-medium">Aluno</th>
                  <th className="text-left py-3 px-3 text-content-secondary font-medium">Faixa</th>
                  <th className="text-left py-3 px-3 text-content-secondary font-medium">Presenças</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((s, i) => (
                  <tr
                    key={s.id}
                    className="border-b border-border hover:bg-surface-tertiary cursor-pointer transition-colors"
                    onClick={() => router.push(`/admin/students/${s.id}`)}
                  >
                    <td className="py-3 px-3 text-content-muted font-medium">{i + 1}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <StudentAvatar name={s.name} photoUrl={s.photoUrl} size={32} />
                        <span className="font-medium text-content-primary">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <BeltIcon belt={s.belt} size={16} />
                        <span className="text-content-secondary">
                          {s.belt}{s.degrees > 0 ? ` ${s.degrees}°` : ""}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-content-primary">{s.checkins}</span>
                    </td>
                  </tr>
                ))}
                {sortedStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-content-muted">
                      Nenhum dado de presença no período
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
