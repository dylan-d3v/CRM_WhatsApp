import { getAppointmentBusinessContext } from "@/server/appointments/context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const GUAYAQUIL_UTC_OFFSET = "-05:00";

export const APPOINTMENT_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type AppointmentListItem = {
  customerId: string;
  customerName: string;
  endsAt: string;
  id: string;
  internalNotes: string | null;
  serviceId: string;
  serviceName: string;
  startsAt: string;
  status: AppointmentStatus;
};

export type AppointmentOption = {
  id: string;
  label: string;
};

export type AppointmentServiceOption = {
  duration_minutes: number;
  id: string;
  is_active: boolean;
  name: string;
};

export type AppointmentListResult = {
  appointments: AppointmentListItem[];
  customers: AppointmentOption[];
  date: string;
  errorMessage: string | null;
  services: AppointmentServiceOption[];
};

export type AppointmentDetail = {
  customer_id: string;
  ends_at: string;
  id: string;
  internal_notes: string | null;
  service_id: string;
  starts_at: string;
  status: AppointmentStatus;
};

export type AppointmentDetailResult = {
  appointment: AppointmentDetail | null;
  customers: AppointmentOption[];
  errorMessage: string | null;
  services: AppointmentServiceOption[];
};

function isValidDateText(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00${GUAYAQUIL_UTC_OFFSET}`);
  return Number.isFinite(parsed.getTime());
}

export function getTodayInGuayaquil() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Guayaquil",
    year: "numeric",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

export function normalizeDateInput(rawDate: string | undefined) {
  const value = rawDate?.trim() ?? "";

  if (isValidDateText(value)) {
    return value;
  }

  return getTodayInGuayaquil();
}

function getUtcRangeForGuayaquilDate(date: string) {
  const start = new Date(`${date}T00:00:00${GUAYAQUIL_UTC_OFFSET}`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    endIso: end.toISOString(),
    startIso: start.toISOString(),
  };
}

async function getAppointmentBaseOptions(
  businessId: string,
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
) {
  const [{ data: customers, error: customersError }, { data: services, error: servicesError }] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id, name")
        .eq("business_id", businessId)
        .order("name", { ascending: true }),
      supabase
        .from("services")
        .select("id, name, duration_minutes, is_active")
        .eq("business_id", businessId)
        .order("is_active", { ascending: false })
        .order("name", { ascending: true }),
    ]);

  if (customersError || servicesError) {
    return {
      customers: [] as AppointmentOption[],
      errorMessage: "No se pudo cargar clientes y servicios para citas.",
      services: [] as AppointmentServiceOption[],
    };
  }

  return {
    customers: (customers ?? []).map((customer) => ({
      id: customer.id,
      label: customer.name,
    })),
    errorMessage: null,
    services: services ?? [],
  };
}

export async function getAppointmentsByDate(rawDate: string | undefined): Promise<AppointmentListResult> {
  const context = await getAppointmentBusinessContext();
  const date = normalizeDateInput(rawDate);

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      return {
        appointments: [],
        customers: [],
        date,
        errorMessage: "Debes iniciar sesion para ver citas.",
        services: [],
      };
    }

    return {
      appointments: [],
      customers: [],
      date,
      errorMessage: "Completa el onboarding para habilitar citas.",
      services: [],
    };
  }

  const baseOptions = await getAppointmentBaseOptions(context.businessId, context.supabase);
  const { startIso, endIso } = getUtcRangeForGuayaquilDate(date);

  const { data: appointments, error: appointmentsError } = await context.supabase
    .from("appointments")
    .select("id, customer_id, service_id, starts_at, ends_at, status, internal_notes")
    .eq("business_id", context.businessId)
    .gte("starts_at", startIso)
    .lt("starts_at", endIso)
    .order("starts_at", { ascending: true });

  if (appointmentsError) {
    return {
      appointments: [],
      customers: baseOptions.customers,
      date,
      errorMessage: "No se pudo cargar la agenda para la fecha seleccionada.",
      services: baseOptions.services,
    };
  }

  const customerMap = new Map(baseOptions.customers.map((customer) => [customer.id, customer.label]));
  const serviceMap = new Map(baseOptions.services.map((service) => [service.id, service.name]));

  const appointmentList: AppointmentListItem[] = (appointments ?? []).map((appointment) => ({
    customerId: appointment.customer_id,
    customerName: customerMap.get(appointment.customer_id) ?? "Cliente",
    endsAt: appointment.ends_at,
    id: appointment.id,
    internalNotes: appointment.internal_notes,
    serviceId: appointment.service_id,
    serviceName: serviceMap.get(appointment.service_id) ?? "Servicio",
    startsAt: appointment.starts_at,
    status: appointment.status,
  }));

  return {
    appointments: appointmentList,
    customers: baseOptions.customers,
    date,
    errorMessage: baseOptions.errorMessage,
    services: baseOptions.services,
  };
}

export async function getAppointmentDetail(
  appointmentId: string,
): Promise<AppointmentDetailResult> {
  const context = await getAppointmentBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      return {
        appointment: null,
        customers: [],
        errorMessage: "Debes iniciar sesion para ver esta cita.",
        services: [],
      };
    }

    return {
      appointment: null,
      customers: [],
      errorMessage: "Completa el onboarding para habilitar citas.",
      services: [],
    };
  }

  const [baseOptions, appointmentResult] = await Promise.all([
    getAppointmentBaseOptions(context.businessId, context.supabase),
    context.supabase
      .from("appointments")
      .select("id, customer_id, service_id, starts_at, ends_at, status, internal_notes")
      .eq("business_id", context.businessId)
      .eq("id", appointmentId)
      .maybeSingle(),
  ]);

  const { data: appointment, error: appointmentError } = appointmentResult;

  if (appointmentError) {
    return {
      appointment: null,
      customers: baseOptions.customers,
      errorMessage: "No se pudo cargar la cita.",
      services: baseOptions.services,
    };
  }

  if (!appointment) {
    return {
      appointment: null,
      customers: baseOptions.customers,
      errorMessage: "Cita no encontrada.",
      services: baseOptions.services,
    };
  }

  return {
    appointment,
    customers: baseOptions.customers,
    errorMessage: baseOptions.errorMessage,
    services: baseOptions.services,
  };
}
