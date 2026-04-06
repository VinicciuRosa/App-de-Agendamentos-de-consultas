// Payment types for NutriAgenda financial module

export type PaymentType = "entrada" | "saida";

export type PaymentMethod =
  | "dinheiro"
  | "pix"
  | "cartao_credito"
  | "cartao_debito"
  | "transferencia";

export interface Payment {
  id: string;
  type: PaymentType;
  category: string;
  description: string;
  amount: number; // BRL, always positive
  date: string;   // YYYY-MM-DD
  patientName?: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface PaymentSummary {
  totalEntradas: number;
  totalSaidas: number;
  balance: number;
  thisMonthEntradas: number;
  thisMonthSaidas: number;
}

export const INCOME_CATEGORIES = [
  "Consulta - Primeira Consulta",
  "Consulta - Retorno",
  "Consulta - Avaliação Física",
  "Consulta - Reeducação Alimentar",
  "Plano Alimentar",
  "Acompanhamento Mensal",
  "Outros Recebimentos",
];

export const EXPENSE_CATEGORIES = [
  "Aluguel",
  "Material de Escritório",
  "Software / Sistemas",
  "Marketing",
  "Cursos e Capacitação",
  "Impostos e Taxas",
  "Manutenção",
  "Salários",
  "Outros Gastos",
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: "pix",            label: "PIX",              icon: "⚡" },
  { value: "dinheiro",       label: "Dinheiro",         icon: "💵" },
  { value: "cartao_credito", label: "Cartão de Crédito",icon: "💳" },
  { value: "cartao_debito",  label: "Cartão de Débito", icon: "💳" },
  { value: "transferencia",  label: "Transferência",    icon: "🏦" },
];
