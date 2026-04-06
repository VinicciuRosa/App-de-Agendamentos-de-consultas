import { useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { EmailService } from "../lib/emailjs";
import {
  type NutritionAppointment,
  type AppointmentStatus,
  type AppointmentStats,
} from "../types";

export function useAppointments() {
  const [appointments, setAppointments] = useState<NutritionAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (!error && data) {
      setAppointments(data as NutritionAppointment[]);
    } else {
      console.error("Failed to fetch appointments:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAppointments();

    const channel = supabase
      .channel("public:appointments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAppointments]);

  const create = useCallback(
    async (data: Omit<NutritionAppointment, "id" | "createdAt" | "updatedAt">) => {
      const { data: newApt, error } = await supabase
        .from("appointments")
        .insert([{ ...data, user_id: (await supabase.auth.getUser()).data.user?.id }])
        .select()
        .single();

      if (error) {
        console.error("Failed to create:", error);
        throw error;
      }

      await EmailService.onAppointmentCreated(newApt);
      return newApt as NutritionAppointment;
    },
    []
  );

  const update = useCallback(
    async (id: string, data: Partial<NutritionAppointment>) => {
      const { data: updatedApt, error } = await supabase
        .from("appointments")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Failed to update:", error);
        throw error;
      }
      return updatedApt;
    },
    []
  );

  const remove = useCallback(
    async (id: string) => {
      const apt = appointments.find((a) => a.id === id);
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) {
        console.error("Failed to delete:", error);
        throw error;
      }
      
      if (apt) {
        await EmailService.onAppointmentCancelled(apt);
      }
    },
    [appointments]
  );

  const updateStatus = useCallback(
    async (id: string, status: AppointmentStatus) => {
      return await update(id, { status });
    },
    [update]
  );

  const getStats = useCallback((): AppointmentStats => {
    const today = new Date().toISOString().split("T")[0];
    return {
      total: appointments.length,
      today: appointments.filter((a) => a.date === today).length,
      pending: appointments.filter((a) => a.status === "agendado").length,
      confirmed: appointments.filter((a) => a.status === "confirmado").length,
      cancelled: appointments.filter((a) => a.status === "cancelado").length,
      completed: appointments.filter((a) => a.status === "concluido").length,
    };
  }, [appointments]);

  return { appointments, loading, create, update, remove, updateStatus, getStats };
}
