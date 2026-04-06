import emailjs from "@emailjs/browser";
import { type NutritionAppointment } from "../types";

export const CONFIG = {
  clinic: {
    name: "NutriAgenda",
    fullName: "Clínica NutriSaúde",
    doctorName: "Dra. Ana Paula Gomes",
    doctorEmail: "draapaula@nutrisaude.com.br",
    phone: "(11) 99999-9999",
    address: "Rua da Saúde, 123 — São Paulo, SP",
    crn: "CRN-3 99999",
  },

  emailjs: {
    publicKey: "YOUR_PUBLIC_KEY",
    serviceId: "YOUR_SERVICE_ID",
    templates: {
      patientConfirmation: "template_patient_confirm",
      patientCancellation: "template_patient_cancel",
      doctorNotification: "template_doctor_notify",
    },
  },

  system: {
    emailEnabled: false, // Set to true when configured
    workingHours: { start: "08:00", end: "18:00" },
    appointmentDurations: [30, 45, 60, 90],
    defaultDuration: 60,
  },
};

// Auto-init EmailJS
if (
  CONFIG.system.emailEnabled &&
  CONFIG.emailjs.publicKey !== "YOUR_PUBLIC_KEY"
) {
  emailjs.init({ publicKey: CONFIG.emailjs.publicKey });
}

export const EmailService = {
  async sendEmail(templateId: string, templateParams: Record<string, string>) {
    if (!CONFIG.system.emailEnabled) {
      console.log(
        "[EmailJS] Simulation Mode. Template:",
        templateId,
        templateParams
      );
      return false;
    }

    try {
      const response = await emailjs.send(
        CONFIG.emailjs.serviceId,
        templateId,
        templateParams
      );
      console.log("[EmailJS] Sent:", response.status, response.text);
      return true;
    } catch (err) {
      console.error("[EmailJS] Failed:", err);
      return false;
    }
  },

  async onAppointmentCreated(apt: NutritionAppointment) {
    const commonParams = {
      patient_name: apt.patientName,
      patient_email: apt.patientEmail || "N/A",
      patient_phone: apt.patientPhone || "N/A",
      appointment_date: apt.date,
      appointment_time: apt.time,
      appointment_type: apt.type,
      appointment_duration: (apt.duration || 60).toString(),
      patient_goal: apt.goal || "N/A",
      patient_restrictions: apt.restrictions || "N/A",
      appointment_notes: apt.notes || "N/A",
      doctor_name: CONFIG.clinic.doctorName,
      clinic_name: CONFIG.clinic.fullName,
      clinic_address: CONFIG.clinic.address,
      clinic_phone: CONFIG.clinic.phone,
    };

    if (apt.patientEmail) {
      await this.sendEmail(CONFIG.emailjs.templates.patientConfirmation, {
        ...commonParams,
        to_name: apt.patientName,
        to_email: apt.patientEmail,
        reply_to: CONFIG.clinic.doctorEmail,
      });
    }

    await this.sendEmail(CONFIG.emailjs.templates.doctorNotification, {
      ...commonParams,
      to_name: CONFIG.clinic.doctorName,
      to_email: CONFIG.clinic.doctorEmail,
      reply_to: apt.patientEmail || CONFIG.clinic.doctorEmail,
    });
  },

  async onAppointmentCancelled(apt: NutritionAppointment) {
    if (!apt.patientEmail) return;

    await this.sendEmail(CONFIG.emailjs.templates.patientCancellation, {
      patient_name: apt.patientName,
      appointment_date: apt.date,
      appointment_time: apt.time,
      doctor_name: CONFIG.clinic.doctorName,
      clinic_name: CONFIG.clinic.fullName,
      clinic_phone: CONFIG.clinic.phone,
      to_name: apt.patientName,
      to_email: apt.patientEmail,
      reply_to: CONFIG.clinic.doctorEmail,
    });
  },
};
