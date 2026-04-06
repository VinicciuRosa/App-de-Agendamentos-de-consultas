import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";

const STORAGE_KEY = "nutriagenda_profile";

interface ClinicProfile {
  doctorName: string;
  crn: string;
  specialty: string;
  doctorEmail: string;
  clinicName: string;
  clinicPhone: string;
  clinicAddress: string;
  clinicHours: string;
}

const DEFAULT_PROFILE: ClinicProfile = {
  doctorName: "Dra. Ana Paula Souza",
  crn: "CRN-3 12345",
  specialty: "Nutrição Clínica e Esportiva",
  doctorEmail: "nutricionista@nutriagenda.com.br",
  clinicName: "NutriHub Clínica",
  clinicPhone: "(11) 3456-7890",
  clinicAddress: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
  clinicHours: "Segunda a Sexta: 8h às 18h | Sábado: 8h às 12h",
};

function loadProfile(): ClinicProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClinicProfile) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function PatientProfile() {
  const [profile, setProfile] = useState<ClinicProfile>(loadProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ClinicProfile>(profile);

  const set = <K extends keyof ClinicProfile>(key: K, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setProfile(draft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setEditing(false);
    toast.success("Perfil atualizado com sucesso!");
  };

  const handleEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Doctor Card */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.doctorName.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-bold">{profile.doctorName}</p>
                <p className="text-sm text-muted-foreground font-normal">{profile.crn}</p>
              </div>
            </CardTitle>
            {!editing && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                ✏️ Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {!editing ? (
            <div className="space-y-4">
              <Section title="Dados Profissionais">
                <Field label="Nome" value={profile.doctorName} />
                <Field label="Registro" value={profile.crn} />
                <Field label="Especialidade" value={profile.specialty} />
                <Field label="E-mail" value={profile.doctorEmail} />
              </Section>
              <Section title="Dados da Clínica">
                <Field label="Nome da Clínica" value={profile.clinicName} />
                <Field label="Telefone" value={profile.clinicPhone} />
                <Field label="Endereço" value={profile.clinicAddress} />
                <Field label="Horário de Atendimento" value={profile.clinicHours} />
              </Section>
            </div>
          ) : (
            <div className="space-y-4">
              <Section title="Dados Profissionais">
                <FormField label="Nome completo" value={draft.doctorName} onChange={(v) => set("doctorName", v)} />
                <FormField label="CRN" value={draft.crn} onChange={(v) => set("crn", v)} />
                <FormField label="Especialidade" value={draft.specialty} onChange={(v) => set("specialty", v)} />
                <FormField label="E-mail profissional" value={draft.doctorEmail} onChange={(v) => set("doctorEmail", v)} type="email" />
              </Section>
              <Section title="Dados da Clínica">
                <FormField label="Nome da Clínica" value={draft.clinicName} onChange={(v) => set("clinicName", v)} />
                <FormField label="Telefone" value={draft.clinicPhone} onChange={(v) => set("clinicPhone", v)} />
                <FormField label="Endereço" value={draft.clinicAddress} onChange={(v) => set("clinicAddress", v)} />
                <FormField label="Horário de Atendimento" value={draft.clinicHours} onChange={(v) => set("clinicHours", v)} />
              </Section>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  💾 Salvar Alterações
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-green-700 mb-3 border-b pb-1">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
