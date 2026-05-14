import { BELT_COLORS } from "@/lib/utils";

export function BeltIcon({
  belt,
  size = 24,
}: {
  belt: string;
  size?: number;
}) {
  const color = BELT_COLORS[belt] || "#FFFFFF";
  const isWhite = belt === "BRANCA";

  return (
    <div
      className="rounded-full inline-flex items-center justify-center"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        border: isWhite ? "2px solid #D1D5DB" : "2px solid transparent",
      }}
      title={belt}
    />
  );
}
