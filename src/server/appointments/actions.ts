"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  APPOINTMENT_STATUSES,
  type AppointmentStatus,
  normalizeDateInput,
} from "@/server/appointments/queries";
import { getAppointmentBusinessContext } from "@/server/appointments/context";

const GUAYAQUIL_UTC_OFFSET = "-05:00";

function readTextField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function withParams(path: string, values: Record<string, string>) {
  const params = new URLSearchParams(values);
  return `${path}?${params.toString()}`;
}

function redirectWithError(path: string, message: string, date?: string): never {
  const values: Record<string, string> = { error: message };

  if (date) {
    values.date = date;
  }

  redirect(withParams(path, values));
}

function redirectWithSuccess(path: string, message: string, date?: string): never {
  const values: Record<string, string> = { success: message };

  if (date) {
    values.date = date;
  }

  redirect(withParams(path, values));
}

function parseGuayaquilDateTime(rawValue: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(rawValue)) {
    return null;
  }

  const parsed = new Date(`${rawValue}:00${GUAYAQUIL_UTC_OFFSET}`);

  if (!Number.isFinite(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function isValidStatus(value: string): value is AppointmentStatus {
  return APPOINTMENT_STATUSES.includes(value as AppointmentStatus);
}

export async function createAppointmentAction(formData: FormData) {
  const context = await getAppointmentBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      redirect("/login");
    }

    redirectWithError("/onboarding", "Completa el onboarding antes de crear citas.");
  }

  const customerId = readTextField(formData, "customer_id");
  const serviceId = readTextField(formData, "service_id");
  const startsAtRaw = readTextField(formData, "starts_at");
  const status = readTextField(formData, "status");
  const internalNotes = readTextField(formData, "internal_notes");
  const selectedDate = normalizeDateInput(readTextField(formData, "redirect_date"));

  if (!customerId || !serviceId || !startsAtRaw || !isValidStatus(status)) {
    redirectWithError("/appointments", "Completa los campos obligatorios de la cita.", selectedDate);
  }

  const startsAt = parseGuayaquilDateTime(startsAtRaw);

  if (!startsAt) {
    redirectWithError("/appointments", "Fecha y hora de inicio invalidas.", selectedDate);
  }

  const [{ data: customer }, { data: service }] = await Promise.all([
    context.supabase
      .from("customers")
      .select("id")
      .eq("business_id", context.businessId)
      .eq("id", customerId)
      .maybeSingle(),
    context.supabase
      .from("services")
      .select("id, duration_minutes, is_active")
      .eq("business_id", context.businessId)
      .eq("id", serviceId)
      .maybeSingle(),
  ]);

  if (!customer) {
    redirectWithError("/appointments", "Cliente no valido para esta cita.", selectedDate);
  }

  if (!service || !service.is_active) {
    redirectWithError("/appointments", "Servicio no valido o inactivo para nuevas citas.", selectedDate);
  }

  const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60 * 1000);

  const { error } = await context.supabase.from("appointments").insert({
    business_id: context.businessId,
    customer_id: customerId,
    ends_at: endsAt.toISOString(),
    internal_notes: internalNotes || null,
    service_id: serviceId,
    starts_at: startsAt.toISOString(),
    status,
  });

  if (error) {
    redirectWithError("/appointments", "No se pudo crear la cita.", selectedDate);
  }

  revalidatePath("/appointments");
  revalidatePath(`/customers/${customerId}`);
  redirectWithSuccess("/appointments", "Cita creada.", selectedDate);
}

export async function updateAppointmentAction(formData: FormData) {
  const context = await getAppointmentBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      redirect("/login");
    }

    redirectWithError("/onboarding", "Completa el onboarding antes de editar citas.");
  }

  const appointmentId = readTextField(formData, "appointment_id");
  const customerId = readTextField(formData, "customer_id");
  const serviceId = readTextField(formData, "service_id");
  const startsAtRaw = readTextField(formData, "starts_at");
  const status = readTextField(formData, "status");
  const internalNotes = readTextField(formData, "internal_notes");

  if (!appointmentId || !customerId || !serviceId || !startsAtRaw || !isValidStatus(status)) {
    redirectWithError("/appointments", "Completa los campos obligatorios de la cita.");
  }

  const startsAt = parseGuayaquilDateTime(startsAtRaw);

  if (!startsAt) {
    redirectWithError(`/appointments/${appointmentId}/edit`, "Fecha y hora de inicio invalidas.");
  }

  const [{ data: appointment }, { data: customer }, { data: service }] = await Promise.all([
    context.supabase
      .from("appointments")
      .select("id")
      .eq("business_id", context.businessId)
      .eq("id", appointmentId)
      .maybeSingle(),
    context.supabase
      .from("customers")
      .select("id")
      .eq("business_id", context.businessId)
      .eq("id", customerId)
      .maybeSingle(),
    context.supabase
      .from("services")
      .select("id, duration_minutes")
      .eq("business_id", context.businessId)
      .eq("id", serviceId)
      .maybeSingle(),
  ]);

  if (!appointment) {
    redirectWithError("/appointments", "Cita no encontrada.");
  }

  if (!customer) {
    redirectWithError(`/appointments/${appointmentId}/edit`, "Cliente no valido para esta cita.");
  }

  if (!service) {
    redirectWithError(`/appointments/${appointmentId}/edit`, "Servicio no valido para esta cita.");
  }

  const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60 * 1000);

  const { data, error } = await context.supabase
    .from("appointments")
    .update({
      customer_id: customerId,
      ends_at: endsAt.toISOString(),
      internal_notes: internalNotes || null,
      service_id: serviceId,
      starts_at: startsAt.toISOString(),
      status,
    })
    .eq("business_id", context.businessId)
    .eq("id", appointmentId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    redirectWithError(`/appointments/${appointmentId}/edit`, "No se pudo actualizar la cita.");
  }

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${appointmentId}/edit`);
  revalidatePath(`/customers/${customerId}`);
  redirectWithSuccess("/appointments", "Cita actualizada.");
}

export async function changeAppointmentStatusAction(formData: FormData) {
  const context = await getAppointmentBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      redirect("/login");
    }

    redirectWithError("/onboarding", "Completa el onboarding antes de actualizar citas.");
  }

  const appointmentId = readTextField(formData, "appointment_id");
  const status = readTextField(formData, "status");
  const selectedDate = normalizeDateInput(readTextField(formData, "redirect_date"));

  if (!appointmentId || !isValidStatus(status)) {
    redirectWithError("/appointments", "No se pudo actualizar el estado de la cita.", selectedDate);
  }

  const { data, error } = await context.supabase
    .from("appointments")
    .update({ status })
    .eq("business_id", context.businessId)
    .eq("id", appointmentId)
    .select("id, customer_id")
    .maybeSingle();

  if (error || !data) {
    redirectWithError("/appointments", "No se pudo actualizar el estado de la cita.", selectedDate);
  }

  revalidatePath("/appointments");
  revalidatePath(`/customers/${data.customer_id}`);
  redirectWithSuccess("/appointments", "Estado de cita actualizado.", selectedDate);
}
