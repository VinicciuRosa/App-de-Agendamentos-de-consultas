import { useState, useMemo } from "react";
import { type NutritionAppointment, getTypeInfo, getStatusInfo } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Props {
  appointments: NutritionAppointment[];
}

export function DigitalRecords({ appointments }: Props) {
  const [search, setSearch] = useState("");

  // Group by patient name
  const patientMap = useMemo(() => {
    const map = new Map<string, NutritionAppointment[]>();
    appointments.forEach((apt) => {
      const key = apt.patientName.trim().toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    });
    return map;
  }, [appointments]);

  const patients = useMemo(() => {
    const entries = Array.from(patientMap.entries()).map(([, apts]) => {
      const sorted = [...apts].sort((a, b) => b.date.localeCompare(a.date));
      return { name: sorted[0].patientName, email: sorted[0].patientEmail, phone: sorted[0].patientPhone, appointments: sorted };
    });
    return entries
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [patientMap, search]);

  const fmtDate = (d: string) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar paciente..."
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {patients.length} paciente{patients.length !== 1 ? "s" : ""}
        </span>
      </div>

      {patients.length === 0 && (
        <div className="text-center p-12 text-muted-foreground border rounded-lg bg-white">
          <p className="text-4xl mb-2">📭</p>
          <p className="font-medium">Nenhum paciente encontrado</p>
        </div>
      )}

      {patients.map((patient) => (
        <Card key={patient.name} className="overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-semibold">{patient.name}</p>
                <div className="flex gap-3 text-xs text-muted-foreground font-normal mt-0.5">
                  {patient.email && <span>📧 {patient.email}</span>}
                  {patient.phone && <span>📱 {patient.phone}</span>}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">Data</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">Tipo</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">Objetivo</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Observações</th>
                </tr>
              </thead>
              <tbody>
                {patient.appointments.map((apt, i) => {
                  const typeInfo = getTypeInfo(apt.type);
                  const statusInfo = getStatusInfo(apt.status);
                  return (
                    <tr key={apt.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="p-3 font-medium whitespace-nowrap">
                        {fmtDate(apt.date)} {apt.time}
                      </td>
                      <td className="p-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: typeInfo.color + "22", color: typeInfo.color }}
                        >
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground hidden sm:table-cell">{apt.goal || "—"}</td>
                      <td className="p-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: statusInfo.color + "22", color: statusInfo.color }}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs hidden md:table-cell max-w-[200px] truncate">
                        {apt.notes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
