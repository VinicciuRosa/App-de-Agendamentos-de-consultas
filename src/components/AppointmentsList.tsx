import { useState } from "react";
import { type NutritionAppointment, type AppointmentStatus, APPOINTMENT_STATUSES, getTypeInfo, getStatusInfo } from "../types";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

interface Props {
  appointments: NutritionAppointment[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onDelete: (id: string) => void;
}

const statusFilter: { label: string; value: AppointmentStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Agendados", value: "agendado" },
  { label: "Confirmados", value: "confirmado" },
  { label: "Concluídos", value: "concluido" },
  { label: "Cancelados", value: "cancelado" },
];

export function AppointmentsList({ appointments, onUpdateStatus, onDelete }: Props) {
  const [filter, setFilter] = useState<AppointmentStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = appointments
    .filter((a) => filter === "all" || a.status === filter)
    .filter((a) => a.patientName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const fmtDate = (d: string) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar paciente..."
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex gap-2 flex-wrap">
          {statusFilter.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === s.value
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center p-12 text-muted-foreground border rounded-lg bg-white">
          <p className="text-4xl mb-2">📭</p>
          <p className="font-medium">Nenhuma consulta encontrada</p>
          <p className="text-sm mt-1">Tente outro filtro ou agende uma nova consulta.</p>
        </div>
      )}

      {filtered.map((apt) => {
        const typeInfo = getTypeInfo(apt.type);
        const statusInfo = getStatusInfo(apt.status);
        const isExpanded = expanded === apt.id;

        return (
          <Card key={apt.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="p-0">
              {/* Color bar by type */}
              <div className="h-1" style={{ backgroundColor: typeInfo.color }} />
              <div className="p-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">{apt.patientName}</h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: statusInfo.color + "22",
                          color: statusInfo.color,
                        }}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {typeInfo.label} · {fmtDate(apt.date)} às {apt.time} · {apt.duration} min
                    </p>
                    {apt.goal && (
                      <p className="text-xs text-muted-foreground mt-0.5">🎯 {apt.goal}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : apt.id)}
                    className="text-xs text-blue-600 hover:underline whitespace-nowrap flex-shrink-0"
                  >
                    {isExpanded ? "▲ Fechar" : "▼ Detalhes"}
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {apt.patientEmail && (
                        <p><span className="text-muted-foreground">📧 Email:</span> {apt.patientEmail}</p>
                      )}
                      {apt.patientPhone && (
                        <p><span className="text-muted-foreground">📱 Telefone:</span> {apt.patientPhone}</p>
                      )}
                      {apt.restrictions && (
                        <p><span className="text-muted-foreground">⚠️ Restrições:</span> {apt.restrictions}</p>
                      )}
                      {apt.notes && (
                        <p className="sm:col-span-2"><span className="text-muted-foreground">📝 Observações:</span> {apt.notes}</p>
                      )}
                    </div>

                    {/* Status change */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Alterar status:</p>
                      <div className="flex gap-2 flex-wrap">
                        {APPOINTMENT_STATUSES.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => onUpdateStatus(apt.id, s.value)}
                            className={`text-xs px-3 py-1 rounded-full border transition-all ${
                              apt.status === s.value
                                ? "text-white border-transparent"
                                : "bg-white hover:opacity-80"
                            }`}
                            style={
                              apt.status === s.value
                                ? { backgroundColor: s.color, borderColor: s.color }
                                : { borderColor: s.color, color: s.color }
                            }
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(apt.id)}
                        className="text-xs"
                      >
                        🗑 Remover Consulta
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
