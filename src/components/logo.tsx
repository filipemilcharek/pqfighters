import Image from "next/image";

export function Logo({ size = 72, logoUrl }: { size?: number; logoUrl?: string | null }) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt="Logo"
        width={size}
        height={size}
        className="rounded-xl object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const fontSize = size * 0.47;
  const radius = size * 0.2;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="120" height="120" rx={radius / size * 120} fill="var(--color-accent, #f97316)" />
      <text
        x="60"
        y="78"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontWeight="800"
        fontSize={fontSize / size * 120}
        fill="white"
      >
        FP
      </text>
    </svg>
  );
}
