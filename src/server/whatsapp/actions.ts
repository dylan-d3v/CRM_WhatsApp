"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { buildWhatsAppUrl, normalizePhoneForWhatsApp } from "@/lib/whatsapp/url";
import {
  DEFAULT_MESSAGE_TEMPLATES,
  isMessageTemplateType,
  renderMessageTemplate,
} from "@/lib/whatsapp/templates";
import { getAppointmentBusinessContext } from "@/server/appointments/context";

function readTextField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getSafeReturnPath(rawPath: string) {
  if (!rawPath || !rawPath.startsWith("/")) {
    return "/appointments";
  }

  return rawPath;
}

function withFeedback(path: string, key: "error" | "success", message: string) {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set(key, message);
  return `${pathname}?${params.toString()}`;
}

function formatDateTimeForMessage(value: string, timezone: string) {
  const date = new Date(value);

  return {
    dateText: new Intl.DateTimeFormat("es-EC", {
      dateStyle: "full",
      timeZone: timezone,
    }).format(date),
    hourText: new Intl.DateTimeFormat("es-EC", {
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      timeZone: timezone,
    }).format(date),
  };
}

function formatPriceForMessage(value: number | string | null) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  return new Intl.NumberFormat("es-EC", {
    currency: "USD",
    style: "currency",
  }).format(numericValue);
}

export async function openWhatsAppForAppointmentAction(formData: FormData) {
  const context = await getAppointmentBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      redirect("/login");
    }

    redirect("/onboarding?error=Completa el onboarding para habilitar WhatsApp.");
  }

  const appointmentId = readTextField(formData, "appointment_id");
  const templateTypeRaw = readTextField(formData, "template_type");
  const returnPath = getSafeReturnPath(readTextField(formData, "return_path"));

  if (!appointmentId || !isMessageTemplateType(templateTypeRaw)) {
    redirect(withFeedback(returnPath, "error", "No se pudo preparar el mensaje de WhatsApp."));
  }

  const [{ data: appointment }, { data: business }, { data: template, error: templateError }] =
    await Promise.all([
      context.supabase
        .from("appointments")
        .select("id, customer_id, service_id, starts_at")
        .eq("business_id", context.businessId)
        .eq("id", appointmentId)
        .maybeSingle(),
      context.supabase
        .from("businesses")
        .select("id, name, timezone")
        .eq("id", context.businessId)
        .maybeSingle(),
      context.supabase
        .from("message_templates")
        .select("body")
        .eq("business_id", context.businessId)
        .eq("type", templateTypeRaw)
        .maybeSingle(),
    ]);

  if (!appointment || !business || templateError) {
    redirect(withFeedback(returnPath, "error", "No se pudo cargar la cita para WhatsApp."));
  }

  const [{ data: customer }, { data: service }] = await Promise.all([
    context.supabase
      .from("customers")
      .select("id, name, phone, phone_e164")
      .eq("business_id", context.businessId)
      .eq("id", appointment.customer_id)
      .maybeSingle(),
    context.supabase
      .from("services")
      .select("id, name, price")
      .eq("business_id", context.businessId)
      .eq("id", appointment.service_id)
      .maybeSingle(),
  ]);

  if (!customer || !service) {
    redirect(withFeedback(returnPath, "error", "No se pudo resolver cliente o servicio para WhatsApp."));
  }

  const whatsappPhone = normalizePhoneForWhatsApp(customer.phone, customer.phone_e164);

  if (!whatsappPhone) {
    redirect(withFeedback(returnPath, "error", "Telefono del cliente invalido para abrir WhatsApp."));
  }

  const timezone = business.timezone || "America/Guayaquil";
  const { dateText, hourText } = formatDateTimeForMessage(appointment.starts_at, timezone);
  const templateBody = template?.body ?? DEFAULT_MESSAGE_TEMPLATES[templateTypeRaw].body;
  const renderedMessage = renderMessageTemplate(templateBody, {
    cliente: customer.name,
    fecha: dateText,
    hora: hourText,
    negocio: business.name,
    precio: formatPriceForMessage(service.price),
    servicio: service.name,
  });
  const whatsappUrl = buildWhatsAppUrl(whatsappPhone, renderedMessage);

  const { error: messageEventError } = await context.supabase.from("message_events").insert({
    appointment_id: appointment.id,
    business_id: context.businessId,
    created_by: context.userId,
    customer_id: customer.id,
    template_type: templateTypeRaw,
    whatsapp_url_opened_at: new Date().toISOString(),
  });

  if (messageEventError) {
    redirect(withFeedback(returnPath, "error", "No se pudo registrar la apertura de WhatsApp."));
  }

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  revalidatePath(`/customers/${customer.id}`);
  redirect(whatsappUrl);
}
