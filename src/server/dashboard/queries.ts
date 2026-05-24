import { getAppointmentBusinessContext } from "@/server/appointments/context";
import { getTodayInGuayaquil, type AppointmentStatus } from "@/server/appointments/queries";

const GUAYAQUIL_UTC_OFFSET = "-05:00";
const UPCOMING_LIMIT = 5;
const TODAY_LIMIT = 8;
const PENDING_CANCELLED_LIMIT = 8;
const RECENT_CUSTOMERS_LIMIT = 5;

type DashboardAppointmentRow = {
  customer_id: string;
  id: string;
  service_id: string;
  starts_at: string;
  status: AppointmentStatus;
};

type CustomerLookupRow = {
  id: string;
  name: string;
};

type ServiceLookupRow = {
  id: string;
  name: string;
};

export type DashboardAppointmentItem = {
  customerName: string;
  id: string;
  serviceName: string;
  startsAt: string;
  status: AppointmentStatus;
};

export type DashboardRecentCustomerItem = {
  createdAt: string;
  id: string;
  name: string;
  phone: string;
};

export type DashboardSummary = {
  cancelledCount: number;
  pendingCount: number;
  todayCount: number;
  upcomingCount: number;
};

export type DashboardDataResult = {
  errorMessage: string | null;
  pendingCancelledAppointments: DashboardAppointmentItem[];
  recentCustomers: DashboardRecentCustomerItem[];
  summary: DashboardSummary;
  todayAppointments: DashboardAppointmentItem[];
  upcomingAppointments: DashboardAppointmentItem[];
};

type RecentCustomerRow = {
  created_at: string;
  id: string;
  name: string;
  phone: string;
};

function getUtcRangeForGuayaquilDate(date: string) {
  const start = new Date(`${date}T00:00:00${GUAYAQUIL_UTC_OFFSET}`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    endIso: end.toISOString(),
    startIso: start.toISOString(),
  };
}

function mapAppointments(
  appointments: DashboardAppointmentRow[],
  customerMap: Map<string, string>,
  serviceMap: Map<string, string>,
) {
  return appointments.map((appointment) => ({
    customerName: customerMap.get(appointment.customer_id) ?? "Cliente",
    id: appointment.id,
    serviceName: serviceMap.get(appointment.service_id) ?? "Servicio",
    startsAt: appointment.starts_at,
    status: appointment.status,
  }));
}

function mapRecentCustomers(customers: RecentCustomerRow[]) {
  return customers.map((customer) => ({
    createdAt: customer.created_at,
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
  }));
}

export async function getDashboardData(): Promise<DashboardDataResult> {
  const context = await getAppointmentBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      return {
        errorMessage: "Debes iniciar sesion para ver el dashboard.",
        pendingCancelledAppointments: [],
        recentCustomers: [],
        summary: {
          cancelledCount: 0,
          pendingCount: 0,
          todayCount: 0,
          upcomingCount: 0,
        },
        todayAppointments: [],
        upcomingAppointments: [],
      };
    }

    return {
      errorMessage: "Completa el onboarding para habilitar el dashboard.",
      pendingCancelledAppointments: [],
      recentCustomers: [],
      summary: {
        cancelledCount: 0,
        pendingCount: 0,
        todayCount: 0,
        upcomingCount: 0,
      },
      todayAppointments: [],
      upcomingAppointments: [],
    };
  }

  const today = getTodayInGuayaquil();
  const { endIso: todayEndIso, startIso: todayStartIso } = getUtcRangeForGuayaquilDate(today);
  const nowIso = new Date().toISOString();

  const [todayResult, upcomingResult, pendingCancelledResult, recentCustomersResult] = await Promise.all([
    context.supabase
      .from("appointments")
      .select("id, customer_id, service_id, starts_at, status")
      .eq("business_id", context.businessId)
      .gte("starts_at", todayStartIso)
      .lt("starts_at", todayEndIso)
      .order("starts_at", { ascending: true })
      .limit(TODAY_LIMIT),
    context.supabase
      .from("appointments")
      .select("id, customer_id, service_id, starts_at, status")
      .eq("business_id", context.businessId)
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true })
      .limit(UPCOMING_LIMIT),
    context.supabase
      .from("appointments")
      .select("id, customer_id, service_id, starts_at, status")
      .eq("business_id", context.businessId)
      .gte("starts_at", todayStartIso)
      .in("status", ["pending", "cancelled"])
      .order("starts_at", { ascending: true })
      .limit(PENDING_CANCELLED_LIMIT),
    context.supabase
      .from("customers")
      .select("id, name, phone, created_at")
      .eq("business_id", context.businessId)
      .order("created_at", { ascending: false })
      .limit(RECENT_CUSTOMERS_LIMIT),
  ]);

  const { data: todayAppointments, error: todayError } = todayResult;
  const { data: upcomingAppointments, error: upcomingError } = upcomingResult;
  const { data: pendingCancelledAppointments, error: pendingCancelledError } = pendingCancelledResult;
  const { data: recentCustomers, error: recentCustomersError } = recentCustomersResult;

  if (todayError || upcomingError || pendingCancelledError || recentCustomersError) {
    return {
      errorMessage: "No se pudieron cargar los datos del dashboard.",
      pendingCancelledAppointments: [],
      recentCustomers: [],
      summary: {
        cancelledCount: 0,
        pendingCount: 0,
        todayCount: 0,
        upcomingCount: 0,
      },
      todayAppointments: [],
      upcomingAppointments: [],
    };
  }

  const allAppointments = [
    ...(todayAppointments ?? []),
    ...(upcomingAppointments ?? []),
    ...(pendingCancelledAppointments ?? []),
  ];

  const customerIds = Array.from(new Set(allAppointments.map((appointment) => appointment.customer_id)));
  const serviceIds = Array.from(new Set(allAppointments.map((appointment) => appointment.service_id)));

  const [customerLookupResult, serviceLookupResult] = await Promise.all([
    customerIds.length === 0
      ? Promise.resolve({ data: [] as CustomerLookupRow[], error: null })
      : context.supabase
          .from("customers")
          .select("id, name")
          .eq("business_id", context.businessId)
          .in("id", customerIds),
    serviceIds.length === 0
      ? Promise.resolve({ data: [] as ServiceLookupRow[], error: null })
      : context.supabase
          .from("services")
          .select("id, name")
          .eq("business_id", context.businessId)
          .in("id", serviceIds),
  ]);

  if (customerLookupResult.error || serviceLookupResult.error) {
    return {
      errorMessage: "No se pudieron resolver clientes y servicios del dashboard.",
      pendingCancelledAppointments: [],
      recentCustomers: mapRecentCustomers(recentCustomers ?? []),
      summary: {
        cancelledCount: 0,
        pendingCount: 0,
        todayCount: 0,
        upcomingCount: 0,
      },
      todayAppointments: [],
      upcomingAppointments: [],
    };
  }

  const customerMap = new Map((customerLookupResult.data ?? []).map((customer) => [customer.id, customer.name]));
  const serviceMap = new Map((serviceLookupResult.data ?? []).map((service) => [service.id, service.name]));

  const todayItems = mapAppointments(todayAppointments ?? [], customerMap, serviceMap);
  const upcomingItems = mapAppointments(upcomingAppointments ?? [], customerMap, serviceMap);
  const pendingCancelledItems = mapAppointments(
    pendingCancelledAppointments ?? [],
    customerMap,
    serviceMap,
  );

  const pendingCount = todayItems.filter((appointment) => appointment.status === "pending").length;
  const cancelledCount = todayItems.filter((appointment) => appointment.status === "cancelled").length;

  return {
    errorMessage: null,
    pendingCancelledAppointments: pendingCancelledItems,
    recentCustomers: mapRecentCustomers(recentCustomers ?? []),
    summary: {
      cancelledCount,
      pendingCount,
      todayCount: todayItems.length,
      upcomingCount: upcomingItems.length,
    },
    todayAppointments: todayItems,
    upcomingAppointments: upcomingItems,
  };
}
