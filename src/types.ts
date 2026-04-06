// Central type definitions for NutriAgenda

export type AppointmentStatus = 'agendado' | 'confirmado' | 'cancelado' | 'concluido';
export type AppointmentType =
  | 'primeira_consulta'
  | 'retorno'
  | 'avaliacao'
  | 'reeducacao';

export interface NutritionAppointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  duration: number; // minutes
  type: AppointmentType;
  goal: string;
  restrictions: string;
  notes: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentStats {
  total: number;
  today: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

export const APPOINTMENT_TYPES: {
  value: AppointmentType;
  label: string;
  color: string;
}[] = [
  { value: 'primeira_consulta', label: 'Primeira Consulta', color: '#10B981' },
  { value: 'retorno',           label: 'Retorno',           color: '#3B82F6' },
  { value: 'avaliacao',         label: 'Avaliação Física',  color: '#8B5CF6' },
  { value: 'reeducacao',        label: 'Reeducação Alimentar', color: '#F59E0B' },
];

export const APPOINTMENT_STATUSES: {
  value: AppointmentStatus;
  label: string;
  color: string;
}[] = [
  { value: 'agendado',   label: 'Agendado',   color: '#F59E0B' },
  { value: 'confirmado', label: 'Confirmado', color: '#10B981' },
  { value: 'cancelado',  label: 'Cancelado',  color: '#EF4444' },
  { value: 'concluido',  label: 'Concluído',  color: '#6B7280' },
];

export const APPOINTMENT_GOALS = [
  'Emagrecimento',
  'Ganho de Massa Muscular',
  'Saúde e Bem-estar',
  'Nutrição Esportiva',
  'Nutrição Clínica',
  'Controle de Diabetes',
  'Redução de Colesterol',
  'Nutrição Infantil',
  'Nutrição na Gestação',
  'Outro',
];

export function getTypeInfo(val: AppointmentType) {
  return APPOINTMENT_TYPES.find((t) => t.value === val) ?? APPOINTMENT_TYPES[0];
}

export function getStatusInfo(val: AppointmentStatus) {
  return APPOINTMENT_STATUSES.find((s) => s.value === val) ?? APPOINTMENT_STATUSES[0];
}
