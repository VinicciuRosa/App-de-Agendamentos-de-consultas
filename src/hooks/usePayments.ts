import { useState, useCallback } from "react";
import { type Payment, type PaymentSummary } from "../payment-types";

const STORAGE_KEY = "nutriagenda_payments";

function load(): Payment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Payment[]) : [];
  } catch {
    return [];
  }
}

function persist(list: Payment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function seedDemo(): Payment[] {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const sub = (d: Date, days: number) => {
    const x = new Date(d); x.setDate(x.getDate() - days); return x;
  };

  const demos: Omit<Payment, "id" | "createdAt">[] = [
    { type: "entrada", category: "Consulta - Primeira Consulta", description: "Consulta Carlos Oliveira", amount: 250, date: fmt(today),        patientName: "Carlos Oliveira", paymentMethod: "pix" },
    { type: "entrada", category: "Consulta - Retorno",           description: "Retorno Juliana Santos",   amount: 180, date: fmt(today),        patientName: "Juliana Santos",  paymentMethod: "cartao_debito" },
    { type: "saida",   category: "Software / Sistemas",          description: "NutriHub Pro - Mensalidade", amount: 89, date: fmt(today),   paymentMethod: "cartao_credito" },
    { type: "entrada", category: "Plano Alimentar",              description: "Plano alimentar Amanda Costa", amount: 120, date: fmt(sub(today, 2)), patientName: "Amanda Costa", paymentMethod: "pix" },
    { type: "entrada", category: "Consulta - Avaliação Física",  description: "Avaliação Roberto Ferreira", amount: 300, date: fmt(sub(today, 3)), patientName: "Roberto Ferreira", paymentMethod: "dinheiro" },
    { type: "saida",   category: "Material de Escritório",       description: "Balança e fita métrica",  amount: 350, date: fmt(sub(today, 5)),  paymentMethod: "cartao_credito" },
    { type: "entrada", category: "Acompanhamento Mensal",        description: "Plano mensal Pedro Alves", amount: 199, date: fmt(sub(today, 7)), patientName: "Pedro Alves",     paymentMethod: "transferencia" },
    { type: "saida",   category: "Aluguel",                      description: "Aluguel do consultório",  amount: 1200, date: fmt(sub(today, 10)), paymentMethod: "transferencia" },
    { type: "entrada", category: "Consulta - Retorno",           description: "Retorno Carlos Oliveira", amount: 180, date: fmt(sub(today, 12)), patientName: "Carlos Oliveira", paymentMethod: "pix" },
    { type: "saida",   category: "Cursos e Capacitação",         description: "Workshop Nutrição Esportiva", amount: 490, date: fmt(sub(today, 15)), paymentMethod: "cartao_credito" },
    { type: "entrada", category: "Consulta - Primeira Consulta", description: "Consulta novo paciente",  amount: 250, date: fmt(sub(today, 18)), paymentMethod: "pix" },
    { type: "saida",   category: "Marketing",                    description: "Anúncio Instagram",       amount: 200, date: fmt(sub(today, 20)), paymentMethod: "cartao_credito" },
  ];

  const now = new Date().toISOString();
  const list: Payment[] = demos.map((d, i) => ({
    ...d,
    id: `demo_pay_${i}_${Date.now()}`,
    createdAt: now,
  }));

  persist(list);
  return list;
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>(() => {
    const stored = load();
    if (stored.length === 0) return seedDemo();
    return stored;
  });

  const add = useCallback((data: Omit<Payment, "id" | "createdAt">) => {
    const now = new Date().toISOString();
    const payment: Payment = { ...data, id: crypto.randomUUID(), createdAt: now };
    setPayments((prev) => {
      const updated = [payment, ...prev];
      persist(updated);
      return updated;
    });
    return payment;
  }, []);

  const remove = useCallback((id: string) => {
    setPayments((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      persist(updated);
      return updated;
    });
  }, []);

  const getSummary = useCallback((): PaymentSummary => {
    const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const entradas = payments.filter((p) => p.type === "entrada");
    const saidas   = payments.filter((p) => p.type === "saida");
    return {
      totalEntradas:      entradas.reduce((s, p) => s + p.amount, 0),
      totalSaidas:        saidas.reduce((s, p) => s + p.amount, 0),
      balance:            entradas.reduce((s, p) => s + p.amount, 0) - saidas.reduce((s, p) => s + p.amount, 0),
      thisMonthEntradas:  entradas.filter((p) => p.date.startsWith(thisMonth)).reduce((s, p) => s + p.amount, 0),
      thisMonthSaidas:    saidas.filter((p) => p.date.startsWith(thisMonth)).reduce((s, p) => s + p.amount, 0),
    };
  }, [payments]);

  /** Returns last N months of aggregated data for charts */
  const getMonthlyChart = useCallback((months = 6) => {
    const result: { month: string; entradas: number; saidas: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      const entradas = payments.filter((p) => p.type === "entrada" && p.date.startsWith(key)).reduce((s, p) => s + p.amount, 0);
      const saidas   = payments.filter((p) => p.type === "saida"   && p.date.startsWith(key)).reduce((s, p) => s + p.amount, 0);
      result.push({ month: label, entradas, saidas });
    }
    return result;
  }, [payments]);

  /** Category breakdown for pie chart */
  const getCategoryBreakdown = useCallback((type: "entrada" | "saida") => {
    const map = new Map<string, number>();
    payments.filter((p) => p.type === type).forEach((p) => {
      map.set(p.category, (map.get(p.category) ?? 0) + p.amount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [payments]);

  return { payments, add, remove, getSummary, getMonthlyChart, getCategoryBreakdown };
}
