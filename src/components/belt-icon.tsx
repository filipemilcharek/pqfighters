import { BELT_COLORS, KIDS_BELT_COLORS, KIDS_BELT_LABELS } from "@/lib/utils";

export function BeltIcon({
  belt,
  size = 24,
}: {
  belt: string;
  size?: number;
}) {
  const adultColor = BELT_COLORS[belt];
  const kidsColors = KIDS_BELT_COLORS[belt];
  const isWhite = belt === "BRANCA";
  const isDual = kidsColors && kidsColors[0] !== kidsColors[1];
  const label = KIDS_BELT_LABELS[belt] || belt;

  return (
    <div
      className="rounded-full inline-flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: isDual
          ? `linear-gradient(90deg, ${kidsColors[0]} 50%, ${kidsColors[1]} 50%)`
          : adultColor || (kidsColors ? kidsColors[0] : "#FFFFFF"),
        border: isWhite ? "2px solid #D1D5DB" : "2px solid transparent",
      }}
      title={label}
    />
  );
}
