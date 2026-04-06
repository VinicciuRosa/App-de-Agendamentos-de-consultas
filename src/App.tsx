import { useState, useEffect } from "react";
import { NutritionistDashboard } from "./components/NutritionistDashboard";
import { ScheduleAppointment } from "./components/ScheduleAppointment";
import { AppointmentsList } from "./components/AppointmentsList";
import { PatientProfile } from "./components/PatientProfile";
import { DigitalRecords } from "./components/DigitalRecords";
import { PaymentSystem } from "./components/PaymentSystem";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { useAppointments } from "./hooks/useAppointments";
import { type NutritionAppointment } from "./types";
import { supabase } from "./lib/supabase";
import { Login } from "./components/Login";

const imgNutritionist =
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800";

const SECTION_TITLES: Record<string, string> = {
  schedule: "Agendar Nova Consulta",
  appointments: "Consultas Agendadas",
  profile: "Meu Perfil",
  records: "Prontuário Digital",
  payment: "Controle de Pagamentos",
};

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [currentSection, setCurrentSection] = useState<string>("dashboard");
  const { appointments, create, remove, updateStatus, getStats } = useAppointments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loadingSession) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <p className="text-gray-500">Iniciando NutriAgenda...</p>
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={() => {}} />;
  }

  const handleScheduleSubmit = async (
    data: Omit<NutritionAppointment, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newApt = await create(data);
      toast.success("Consulta agendada com sucesso!", {
        description: `${newApt.patientName} — ${newApt.date} às ${newApt.time}`,
      });
      setCurrentSection("appointments");
    } catch (e) {
      toast.error("Erro ao agendar consulta");
    }
  };

  const handleDelete = async (id: string) => {
    const apt = appointments.find((a) => a.id === id);
    try {
      await remove(id);
      toast.info("Consulta removida", {
        description: apt?.patientName,
      });
    } catch (e) {
      toast.error("Erro ao remover consulta");
    }
  };

  const stats = getStats();

  const renderContent = () => {
    switch (currentSection) {
      case "dashboard":
        return <NutritionistDashboard onNavigate={setCurrentSection} stats={stats} />;

      case "schedule":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Agendar Nova Consulta</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para agendar a consulta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScheduleAppointment
                onSubmit={handleScheduleSubmit}
                onCancel={() => setCurrentSection("dashboard")}
              />
            </CardContent>
          </Card>
        );

      case "appointments":
        return (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Consultas Agendadas</CardTitle>
                    <CardDescription>Gerencie seus agendamentos</CardDescription>
                  </div>
                  <Button onClick={() => setCurrentSection("schedule")} className="bg-green-600 hover:bg-green-700">
                    + Nova Consulta
                  </Button>
                </div>
              </CardHeader>
            </Card>
            <AppointmentsList
              appointments={appointments}
              onUpdateStatus={updateStatus}
              onDelete={handleDelete}
            />
          </div>
        );

      case "profile":
        return <PatientProfile />;

      case "records":
        return (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl">Prontuário Digital</CardTitle>
                <CardDescription>Histórico de consultas por paciente</CardDescription>
              </CardHeader>
            </Card>
            <DigitalRecords appointments={appointments} />
          </div>
        );

      case "payment":
        return (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl">💳 Controle de Pagamentos</CardTitle>
                <CardDescription>Gerencie entradas, saídas e visualize o desempenho financeiro</CardDescription>
              </CardHeader>
            </Card>
            <PaymentSystem />
          </div>
        );

      case "video":
      case "chat":
      case "evolution":
      case "rating": {
        const labels: Record<string, { title: string; desc: string; icon: string }> = {
          video:    { title: "Vídeo Chamada",   desc: "Consultas online em tempo real",      icon: "🎥" },
          chat:     { title: "Chat Online",     desc: "Mensagens com seus pacientes",        icon: "💬" },
          evolution:{ title: "Evolução",        desc: "Gráficos e progresso dos pacientes",  icon: "📈" },
          rating:   { title: "Avaliações",      desc: "Feedback dos seus pacientes",         icon: "⭐" },
        };
        const info = labels[currentSection];
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{info.icon} {info.title}</CardTitle>
              <CardDescription>{info.desc}</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-16">
              <p className="text-6xl mb-4">{info.icon}</p>
              <p className="text-lg font-medium text-gray-700">Funcionalidade em Development</p>
              <p className="text-sm text-muted-foreground mt-2">Em breve disponível nesta plataforma.</p>
            </CardContent>
          </Card>
        );
      }

      default:
        return <NutritionistDashboard onNavigate={setCurrentSection} stats={stats} />;
    }
  };

  const pageTitle = SECTION_TITLES[currentSection];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Toaster />

      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="NutriHub Logo" className="h-10 w-10 rounded-lg object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">NutriAgenda</h1>
                <p className="text-sm text-muted-foreground">Sistema de Nutrição</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {currentSection !== "dashboard" && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentSection("dashboard")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Início
                </Button>
              )}
              <Button variant="ghost" onClick={() => supabase.auth.signOut()}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero — only on dashboard */}
        {currentSection === "dashboard" && (
          <div className="mb-8">
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-8 flex flex-col justify-center">
                  <h2 className="text-3xl font-bold mb-4">
                    Bem-vindo ao NutriHub
                  </h2>
                  <p className="text-muted-foreground text-lg mb-6">
                    Gerencie suas consultas nutricionais de forma simples e eficiente.
                    Acompanhe seus pacientes, histórico e muito mais.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setCurrentSection("schedule")}
                    >
                      + Agendar Consulta
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setCurrentSection("appointments")}
                    >
                      Ver Agendamentos
                    </Button>
                  </div>
                </div>
                <div className="relative h-64 md:h-auto">
                  <img
                    src={imgNutritionist}
                    alt="Planejamento de Consultas"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Section breadcrumb */}
        {pageTitle && (
          <p className="text-sm text-muted-foreground mb-4">
            Início / <span className="text-gray-700 font-medium">{pageTitle}</span>
          </p>
        )}

        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2026 NutriHub — Sistema de Agendamento de Consultas Nutricionais</p>
          <p className="mt-1">
            {stats.total} consulta{stats.total !== 1 ? "s" : ""} registrada{stats.total !== 1 ? "s" : ""} · {stats.today} hoje
          </p>
        </div>
      </footer>
    </div>
  );
}
