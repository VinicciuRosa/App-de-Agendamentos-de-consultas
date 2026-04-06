import { useState } from "react";
import {
  AreaChart, Area, PieChart, Pie, Cell, Tooltip as ReTooltip,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import {
  type Payment,
  type PaymentMethod,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
} from "../payment-types";
import { usePayments } from "../hooks/usePayments";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";

// ─── Palette ──────────────────────────────────────────────────────────────────
const GREEN  = "#10b981";
const RED    = "#ef4444";
const PIE_COLORS = ["#10b981","#3b82f6","#8b5cf6","#f59e0b","#06b6d4","#ec4899","#f97316","#14b8a6"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDate = (d: string) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

type Tab = "dashboard" | "nova" | "historico";

// ─── Main Component ───────────────────────────────────────────────────────────
export function PaymentSystem() {
  const { payments, add, remove, getSummary, getMonthlyChart, getCategoryBreakdown } = usePayments();
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="space-y-6">
      {/* Tab nav */}
      <div className="flex gap-2 border-b">
        {([ 
          { id: "dashboard", label: "📊 Dashboard"       },
          { id: "nova",      label: "➕ Nova Transação"  },
          { id: "historico", label: "📋 Histórico"       },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardView getSummary={getSummary} getMonthlyChart={getMonthlyChart} getCategoryBreakdown={getCategoryBreakdown} />}
      {tab === "nova"      && <NewTransactionForm add={add} onDone={() => setTab("historico")} />}
      {tab === "historico" && <HistoryView payments={payments} remove={remove} />}
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView({
  getSummary,
  getMonthlyChart,
  getCategoryBreakdown,
}: {
  getSummary: ReturnType<typeof usePayments>["getSummary"];
  getMonthlyChart: ReturnType<typeof usePayments>["getMonthlyChart"];
  getCategoryBreakdown: ReturnType<typeof usePayments>["getCategoryBreakdown"];
}) {
  const summary = getSummary();
  const monthly = getMonthlyChart(6);
  const incomeBreakdown  = getCategoryBreakdown("entrada");
  const expenseBreakdown = getCategoryBreakdown("saida");

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <SummaryCard label="Total Entradas"  value={fmt(summary.totalEntradas)}      color="bg-emerald-500" icon="📈" />
        <SummaryCard label="Total Saídas"    value={fmt(summary.totalSaidas)}        color="bg-red-500"     icon="📉" />
        <SummaryCard label="Saldo Geral"     value={fmt(summary.balance)}            color={summary.balance >= 0 ? "bg-blue-600" : "bg-orange-500"} icon="💰" />
        <SummaryCard label="Entradas Mês"    value={fmt(summary.thisMonthEntradas)}  color="bg-teal-500"    icon="🗓️" />
        <SummaryCard label="Saídas Mês"      value={fmt(summary.thisMonthSaidas)}    color="bg-pink-500"    icon="🗓️" />
      </div>

      {/* Area chart — Entradas vs Saídas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">📊 Entradas × Saídas — Últimos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthly} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={GREEN} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={GREEN} stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={RED} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={RED} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
              <ReTooltip formatter={(v) => typeof v === "number" ? fmt(v) : v} />
              <Legend />
              <Area type="monotone" dataKey="entradas" name="Entradas" stroke={GREEN} fill="url(#colorEntradas)" strokeWidth={2} dot={{ r: 4 }} />
              <Area type="monotone" dataKey="saidas"   name="Saídas"   stroke={RED}   fill="url(#colorSaidas)"   strokeWidth={2} dot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <PieCard title="🟢 Entradas por Categoria" data={incomeBreakdown}  />
        <PieCard title="🔴 Saídas por Categoria"   data={expenseBreakdown} />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div className={`${color} rounded-xl p-4 text-white`}>
      <p className="text-xl">{icon}</p>
      <p className="text-lg font-bold mt-1 leading-tight">{value}</p>
      <p className="text-xs opacity-90 mt-0.5">{label}</p>
    </div>
  );
}

function PieCard({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Sem dados</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                  {data.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip formatter={(v) => typeof v === "number" ? fmt(v) : v} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {data.slice(0, 5).map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="truncate text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-medium ml-2">{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── New Transaction Form ─────────────────────────────────────────────────────
function NewTransactionForm({
  add,
  onDone,
}: {
  add: ReturnType<typeof usePayments>["add"];
  onDone: () => void;
}) {
  const [type, setType] = useState<"entrada" | "saida">("entrada");
  const [category, setCategory] = useState(INCOME_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [patientName, setPatientName] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("pix");

  const categories = type === "entrada" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (t: "entrada" | "saida") => {
    setType(t);
    setCategory(t === "entrada" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(",", "."));
    if (!parsed || parsed <= 0) { toast.error("Informe um valor válido"); return; }
    if (!description) { toast.error("Informe uma descrição"); return; }

    add({
      type,
      category,
      description,
      amount: parsed,
      date,
      patientName: type === "entrada" ? patientName : undefined,
      paymentMethod: method,
    });

    toast.success(`${type === "entrada" ? "Entrada" : "Saída"} registrada!`, {
      description: `${description} — ${fmt(parsed)}`,
    });

    setDescription("");
    setAmount("");
    setPatientName("");
    onDone();
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Nova Transação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-lg overflow-hidden border">
            <button
              type="button"
              onClick={() => handleTypeChange("entrada")}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                type === "entrada" ? "bg-emerald-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              📈 Entrada
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("saida")}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                type === "saida" ? "bg-red-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              📉 Saída
            </button>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium mb-1">Valor (R$) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium mb-1">Descrição *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Consulta retorno, Aluguel maio..."
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Date & method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Forma de Pagamento</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Patient name for income */}
          {type === "entrada" && (
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Paciente (opcional)</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Vincular a um paciente..."
                className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}

          <Button type="submit" className={`w-full ${type === "entrada" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}>
            {type === "entrada" ? "✓ Registrar Entrada" : "✓ Registrar Saída"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── History View ─────────────────────────────────────────────────────────────
function HistoryView({
  payments,
  remove,
}: {
  payments: Payment[];
  remove: (id: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "entrada" | "saida">("all");
  const [search, setSearch] = useState("");

  const filtered = payments
    .filter((p) => filter === "all" || p.type === filter)
    .filter((p) =>
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      (p.patientName ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleDelete = (p: Payment) => {
    if (!confirm(`Remover "${p.description}"?`)) return;
    remove(p.id);
    toast.info("Transação removida");
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar transação..."
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex gap-2">
          {([
            { v: "all",     label: "Todos"   },
            { v: "entrada", label: "Entradas" },
            { v: "saida",   label: "Saídas"   },
          ] as { v: typeof filter; label: string }[]).map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f.v
                  ? f.v === "entrada" ? "bg-emerald-600 text-white" : f.v === "saida" ? "bg-red-600 text-white" : "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center p-12 text-muted-foreground border rounded-lg bg-white">
          <p className="text-4xl mb-2">📭</p>
          <p className="font-medium">Nenhuma transação encontrada</p>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {filtered.map((p) => {
          const method = PAYMENT_METHODS.find((m) => m.value === p.paymentMethod);
          return (
            <div
              key={p.id}
              className="bg-white border rounded-lg px-4 py-3 flex items-center gap-3 hover:shadow-sm transition-shadow"
            >
              {/* Indicator */}
              <div
                className={`w-1 self-stretch rounded-full flex-shrink-0 ${
                  p.type === "entrada" ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              {/* Icon */}
              <span className="text-xl flex-shrink-0">{p.type === "entrada" ? "📈" : "📉"}</span>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{p.description}</p>
                <p className="text-xs text-muted-foreground">
                  {fmtDate(p.date)} · {p.category}
                  {p.patientName && ` · ${p.patientName}`}
                  {method && ` · ${method.icon} ${method.label}`}
                </p>
              </div>
              {/* Amount */}
              <span
                className={`font-bold text-sm flex-shrink-0 ${
                  p.type === "entrada" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {p.type === "entrada" ? "+" : "−"}{fmt(p.amount)}
              </span>
              {/* Delete */}
              <button
                onClick={() => handleDelete(p)}
                className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 ml-1"
                title="Remover"
              >
                🗑
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
