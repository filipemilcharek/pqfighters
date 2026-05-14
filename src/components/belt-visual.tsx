import { BELT_COLORS } from "@/lib/utils";

export function BeltVisual({
  belt,
  degrees = 0,
  width = 280,
}: {
  belt: string;
  degrees?: number;
  width?: number;
}) {
  const color = BELT_COLORS[belt] || "#FFFFFF";
  const isWhite = belt === "BRANCA";
  const height = width * 0.12;
  const tipWidth = width * 0.22;
  const stripeWidth = Math.max(2, width * 0.012);
  const stripeGap = Math.max(3, width * 0.018);
  const stripeHeight = height * 0.7;
  const borderRadius = height * 0.15;

  return (
    <svg
      width={width}
      height={height + 8}
      viewBox={`0 0 ${width} ${height + 8}`}
      className="block"
    >
      <defs>
        <filter id="beltShadow" x="-4%" y="-20%" width="108%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#ffffff" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Belt body */}
      <rect
        x={2}
        y={4}
        width={width - tipWidth - 4}
        height={height}
        rx={borderRadius}
        ry={borderRadius}
        fill={color}
        stroke={isWhite ? "#D1D5DB" : "rgba(255,255,255,0.15)"}
        strokeWidth={0.5}
        filter="url(#beltShadow)"
      />

      {/* Black tip (ponta) */}
      <rect
        x={width - tipWidth - 2}
        y={4}
        width={tipWidth}
        height={height}
        rx={borderRadius}
        ry={borderRadius}
        fill="#1a1a1a"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={0.5}
        filter="url(#beltShadow)"
      />

      {/* Overlap rectangle to merge belt body and tip seamlessly */}
      <rect
        x={width - tipWidth - 6}
        y={4}
        width={8}
        height={height}
        fill={color}
        stroke="none"
      />
      <rect
        x={width - tipWidth - 1}
        y={4}
        width={8}
        height={height}
        fill="#1a1a1a"
        stroke="none"
      />

      {/* Degree stripes (white lines on the black tip) */}
      {Array.from({ length: degrees }).map((_, i) => {
        const x = width - tipWidth + tipWidth * 0.25 + i * (stripeWidth + stripeGap);
        return (
          <rect
            key={i}
            x={x}
            y={4 + (height - stripeHeight) / 2}
            width={stripeWidth}
            height={stripeHeight}
            rx={1}
            fill="#FFFFFF"
          />
        );
      })}

      {/* Subtle top highlight for 3D effect */}
      <rect
        x={2}
        y={4}
        width={width - tipWidth - 4}
        height={height * 0.3}
        rx={borderRadius}
        ry={borderRadius}
        fill="white"
        opacity={isWhite ? 0 : 0.15}
      />

      {/* Belt label inside */}
      <text
        x={(width - tipWidth) / 2}
        y={4 + height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={isWhite ? "#000000" : "#FFFFFF"}
        fontSize={height * 0.38}
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
      >
        {belt}{degrees > 0 ? ` - ${degrees}° grau` : ""}
      </text>
    </svg>
  );
}

export function BeltProgress({
  checkins,
  nextBelt,
  requiredClasses,
  width = 280,
}: {
  checkins: number;
  nextBelt: string | null;
  requiredClasses: number;
  width?: number;
}) {
  if (!nextBelt || requiredClasses <= 0) return null;

  const progress = Math.min(1, checkins / requiredClasses);
  const nextColor = BELT_COLORS[nextBelt] || "#000";

  // The progress fills the belt shape
  const height = width * 0.06;
  const fillWidth = Math.max(0, (width - 4) * progress);

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-zinc-500">
          Progresso para <span className="font-semibold" style={{ color: nextColor }}>{nextBelt}</span>
        </span>
        <span className="text-xs font-medium">
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
            backgroundColor: nextColor,
          }}
        />
      </div>
      <p className="text-xs text-zinc-400 mt-1.5">
        {checkins >= requiredClasses
          ? "Meta atingida! Aluno apto para promoção de faixa."
          : `Faltam ${requiredClasses - checkins} aulas para atingir a meta.`}
      </p>
    </div>
  );
}
