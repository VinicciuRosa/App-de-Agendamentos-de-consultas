import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { type AppointmentStats } from "../types";

interface Props {
  onNavigate: (section: string) => void;
  stats: AppointmentStats;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className={`rounded-xl p-4 text-white flex items-center gap-4`} style={{ backgroundColor: color }}>
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm opacity-90">{label}</p>
      </div>
    </div>
  );
}

export function NutritionistDashboard({ onNavigate, stats }: Props) {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total"      value={stats.total}     icon="📋" color="#6366f1" />
        <StatCard label="Hoje"       value={stats.today}     icon="📅" color="#0ea5e9" />
        <StatCard label="Pendentes"  value={stats.pending}   icon="⏳" color="#f59e0b" />
        <StatCard label="Confirmados" value={stats.confirmed} icon="✅" color="#10b981" />
        <StatCard label="Concluídos" value={stats.completed} icon="🏁" color="#6b7280" />
        <StatCard label="Cancelados" value={stats.cancelled} icon="❌" color="#ef4444" />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Ações Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-green-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <span>📅</span> Agendar Consulta
              </CardTitle>
              <CardDescription>Marque uma nova consulta para um paciente</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => onNavigate("schedule")} className="w-full bg-green-600 hover:bg-green-700">
                Nova Consulta
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <span>📋</span> Consultas Agendadas
              </CardTitle>
              <CardDescription>Veja e gerencie seus agendamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => onNavigate("appointments")} className="w-full" variant="outline">
                Ver Consultas{stats.total > 0 && ` (${stats.total})`}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <span>📁</span> Prontuário Digital
              </CardTitle>
              <CardDescription>Histórico de consultas por paciente</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => onNavigate("records")} className="w-full" variant="outline">
                Acessar Prontuário
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <span>👤</span> Meu Perfil
              </CardTitle>
              <CardDescription>Dados da clínica e do nutricionista</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => onNavigate("profile")} className="w-full" variant="outline">
                Editar Perfil
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <span>🎥</span> Vídeo Chamada
              </CardTitle>
              <CardDescription>Consultas online em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <span>💬</span> Chat
              </CardTitle>
              <CardDescription>Mensagens com pacientes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <span>💳</span> Pagamentos
              </CardTitle>
              <CardDescription>Entradas, saídas e relatório financeiro</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => onNavigate("payment")} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Ver Financeiro
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
