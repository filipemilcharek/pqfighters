export const BELT_COLORS: Record<string, string> = {
  BRANCA: "#FFFFFF",
  AZUL: "#1D4ED8",
  ROXA: "#7C3AED",
  MARROM: "#92400E",
  PRETA: "#000000",
};

export const BELTS = ["BRANCA", "AZUL", "ROXA", "MARROM", "PRETA"];

export const KIDS_BELTS = [
  "BRANCA", "CINZA_BRANCA", "CINZA", "CINZA_PRETA",
  "AMARELA_BRANCA", "AMARELA", "AMARELA_PRETA",
  "LARANJA_BRANCA", "LARANJA", "LARANJA_PRETA",
  "VERDE_BRANCA", "VERDE", "VERDE_PRETA",
];

export const KIDS_BELT_COLORS: Record<string, [string, string]> = {
  BRANCA: ["#FFFFFF", "#FFFFFF"],
  CINZA_BRANCA: ["#9CA3AF", "#FFFFFF"],
  CINZA: ["#9CA3AF", "#9CA3AF"],
  CINZA_PRETA: ["#9CA3AF", "#000000"],
  AMARELA_BRANCA: ["#EAB308", "#FFFFFF"],
  AMARELA: ["#EAB308", "#EAB308"],
  AMARELA_PRETA: ["#EAB308", "#000000"],
  LARANJA_BRANCA: ["#F97316", "#FFFFFF"],
  LARANJA: ["#F97316", "#F97316"],
  LARANJA_PRETA: ["#F97316", "#000000"],
  VERDE_BRANCA: ["#22C55E", "#FFFFFF"],
  VERDE: ["#22C55E", "#22C55E"],
  VERDE_PRETA: ["#22C55E", "#000000"],
};

export const KIDS_BELT_LABELS: Record<string, string> = {
  BRANCA: "Branca",
  CINZA_BRANCA: "Cinza e Branca",
  CINZA: "Cinza",
  CINZA_PRETA: "Cinza e Preta",
  AMARELA_BRANCA: "Amarela e Branca",
  AMARELA: "Amarela",
  AMARELA_PRETA: "Amarela e Preta",
  LARANJA_BRANCA: "Laranja e Branca",
  LARANJA: "Laranja",
  LARANJA_PRETA: "Laranja e Preta",
  VERDE_BRANCA: "Verde e Branca",
  VERDE: "Verde",
  VERDE_PRETA: "Verde e Preta",
};

export function getBeltsForType(isKids: boolean): string[] {
  return isKids ? KIDS_BELTS : BELTS;
}

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

export const PLAN_LABELS: Record<string, string> = {
  ESSENCIAL: "Essencial",
  PRO: "Pro",
  PREMIUM: "Premium",
};

export function getPlanLabel(studentType: string): string {
  return PLAN_LABELS[studentType] || studentType;
}

export function isPremiumOrPro(studentType: string): boolean {
  return studentType === "PREMIUM" || studentType === "PRO";
}

const BILLING_MONTHS: Record<string, number> = {
  MENSAL: 1,
  TRIMESTRAL: 3,
  SEMESTRAL: 6,
  ANUAL: 12,
};

export const BILLING_FREQUENCY_LABELS: Record<string, string> = {
  MENSAL: "Mensal",
  TRIMESTRAL: "Trimestral",
  SEMESTRAL: "Semestral",
  ANUAL: "Anual",
};

function clampDay(year: number, month: number, day: number): number {
  const maxDay = new Date(year, month + 1, 0).getDate();
  return Math.min(day, maxDay);
}

export function getPaymentStatus(
  monthlyDueDay: number | null,
  lastPaymentDate: string | null,
  billingFrequency?: string,
  createdAt?: string,
): { label: string; variant: "green" | "warning" | "danger"; daysInfo?: string } | null {
  if (!monthlyDueDay) return null;

  const now = new Date();
  const freq = billingFrequency || "MENSAL";
  const months = BILLING_MONTHS[freq] || 1;

  if (!lastPaymentDate) {
    // No payment yet — find first due date from createdAt
    if (createdAt) {
      const created = new Date(createdAt);
      let dueYear = created.getFullYear();
      let dueMonth = created.getMonth();
      let dueDay = clampDay(dueYear, dueMonth, monthlyDueDay);
      let firstDue = new Date(dueYear, dueMonth, dueDay);
      if (firstDue <= created) {
        // Next month
        dueMonth += 1;
        if (dueMonth > 11) { dueMonth = 0; dueYear += 1; }
        dueDay = clampDay(dueYear, dueMonth, monthlyDueDay);
        firstDue = new Date(dueYear, dueMonth, dueDay);
      }
      if (now < firstDue) {
        const diffMs = firstDue.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return { label: "Aguardando", variant: "warning", daysInfo: `Vence em ${daysLeft} dias` };
      }
      return { label: "Atrasado", variant: "danger" };
    }
    return { label: "Atrasado", variant: "danger" };
  }

  // Has payment — find which due date it covered, then add N months
  const payment = new Date(lastPaymentDate);
  let coveredYear = payment.getFullYear();
  let coveredMonth = payment.getMonth();
  let coveredDay = clampDay(coveredYear, coveredMonth, monthlyDueDay);
  let coveredDue = new Date(coveredYear, coveredMonth, coveredDay);

  // If payment was before the due date of that month, it covers that month's due
  // If payment was on or after the due date, it covers the next month's due
  if (payment >= coveredDue) {
    coveredMonth += 1;
    if (coveredMonth > 11) { coveredMonth = 0; coveredYear += 1; }
    coveredDay = clampDay(coveredYear, coveredMonth, monthlyDueDay);
    coveredDue = new Date(coveredYear, coveredMonth, coveredDay);
  }

  // Next due = covered due + N months (frequency)
  let nextDueMonth = coveredDue.getMonth() + months;
  let nextDueYear = coveredDue.getFullYear();
  nextDueYear += Math.floor(nextDueMonth / 12);
  nextDueMonth = nextDueMonth % 12;
  const nextDueDay = clampDay(nextDueYear, nextDueMonth, monthlyDueDay);
  const nextDue = new Date(nextDueYear, nextDueMonth, nextDueDay);

  const diffMs = nextDue.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft > 5) return { label: "Em dia", variant: "green", daysInfo: `${daysLeft} dias restantes` };
  if (daysLeft >= 1) return { label: "Pendente", variant: "warning", daysInfo: `Vence em ${daysLeft} dias` };
  return { label: "Atrasado", variant: "danger", daysInfo: `${Math.abs(daysLeft)} dias atrasado` };
}
