import { useState } from "react";
import { Button } from "./ui/button";
import {
  type NutritionAppointment,
  type AppointmentType,
  APPOINTMENT_TYPES,
  APPOINTMENT_GOALS,
} from "../types";

type FormData = Omit<NutritionAppointment, "id" | "createdAt" | "updatedAt">;

interface Props {
  onSubmit: (data: FormData) => void;
  onCancel?: () => void;
}

export function ScheduleAppointment({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<FormData>({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    date: "",
    time: "",
    duration: 60,
    type: "primeira_consulta",
    goal: "Emagrecimento",
    restrictions: "",
    notes: "",
    status: "agendado",
  });

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName || !form.date || !form.time) return;
    onSubmit(form);
    setForm({
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      date: "",
      time: "",
      duration: 60,
      type: "primeira_consulta",
      goal: "Emagrecimento",
      restrictions: "",
      notes: "",
      status: "agendado",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dados do Paciente */}
      <fieldset className="border rounded-lg p-4 space-y-4">
        <legend className="text-sm font-semibold px-1 text-green-700">Dados do Paciente</legend>
        <div>
          <label className="block text-sm font-medium mb-1">Nome completo *</label>
          <input
            type="text"
            value={form.patientName}
            onChange={(e) => set("patientName", e.target.value)}
            placeholder="Ex: Maria Silva"
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="email"
              value={form.patientEmail}
              onChange={(e) => set("patientEmail", e.target.value)}
              placeholder="paciente@email.com"
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <input
              type="tel"
              value={form.patientPhone}
              onChange={(e) => set("patientPhone", e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </fieldset>

      {/* Dados da Consulta */}
      <fieldset className="border rounded-lg p-4 space-y-4">
        <legend className="text-sm font-semibold px-1 text-green-700">Dados da Consulta</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Horário *</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => set("time", e.target.value)}
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duração</label>
            <select
              value={form.duration}
              onChange={(e) => set("duration", Number(e.target.value))}
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>60 minutos</option>
              <option value={90}>90 minutos</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Consulta</label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value as AppointmentType)}
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Objetivo</label>
            <select
              value={form.goal}
              onChange={(e) => set("goal", e.target.value)}
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {APPOINTMENT_GOALS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Informações Clínicas */}
      <fieldset className="border rounded-lg p-4 space-y-4">
        <legend className="text-sm font-semibold px-1 text-green-700">Informações Clínicas</legend>
        <div>
          <label className="block text-sm font-medium mb-1">Restrições alimentares</label>
          <input
            type="text"
            value={form.restrictions}
            onChange={(e) => set("restrictions", e.target.value)}
            placeholder="Ex: Sem lactose, vegetariano..."
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Observações</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Anotações importantes sobre o paciente..."
            rows={3}
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>
      </fieldset>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
          ✓ Agendar Consulta
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
