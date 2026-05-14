export const BELT_COLORS: Record<string, string> = {
  BRANCA: "#FFFFFF",
  AZUL: "#1D4ED8",
  ROXA: "#7C3AED",
  MARROM: "#92400E",
  PRETA: "#000000",
};

export const BELTS = ["BRANCA", "AZUL", "ROXA", "MARROM", "PRETA"];

export const DAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
