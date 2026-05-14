import { BELT_COLORS } from "@/lib/utils";

export function DegreeProgress({
  checkins,
  belt,
  nextDegree,
  requiredClasses,
}: {
  checkins: number;
  belt: string;
  nextDegree: number;
  requiredClasses: number;
}) {
  if (requiredClasses <= 0) return null;

  const progress = Math.min(1, checkins / requiredClasses);
  const color = BELT_COLORS[belt] || "#FFF";
  const height = 6;
  const fillWidth = `${Math.round(progress * 100)}%`;

  return (
    <div className="mb-3 border-t border-zinc-800 pt-3 mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-zinc-500">
          Progresso para <span className="font-semibold text-zinc-300">{nextDegree}° grau</span>
        </span>
        <span className="text-xs font-medium text-zinc-400">
          {checkins} / {requiredClasses}
        </span>
      </div>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor: "#27272a" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: fillWidth,
            backgroundColor: color === "#FFFFFF" ? "#a3a3a3" : color,
          }}
        />
      </div>
      <p className="text-xs text-zinc-400 mt-1.5">
        {checkins >= requiredClasses
          ? `Meta atingida! Aluno apto para o ${nextDegree}° grau.`
          : `Faltam ${requiredClasses - checkins} aulas para o ${nextDegree}° grau.`}
      </p>
    </div>
  );
}
