import { getCustomerBusinessContext } from "@/server/customers/context";

export type CustomerListItem = {
  created_at: string;
  id: string;
  name: string;
  phone: string;
};

export type CustomerDetail = {
  created_at: string;
  id: string;
  last_visit_at: string | null;
  name: string;
  notes: string | null;
  phone: string;
  updated_at: string;
};

export type CustomerHistoryItem = {
  id: string;
  serviceName: string;
  startsAt: string;
  status: string;
};

export type CustomerListResult = {
  customers: CustomerListItem[];
  errorMessage: string | null;
  search: string;
};

export type CustomerDetailResult = {
  customer: CustomerDetail | null;
  errorMessage: string | null;
  history: CustomerHistoryItem[];
};

function normalizeSearch(rawSearch: string | undefined) {
  return rawSearch?.trim() ?? "";
}

function escapeSupabaseLike(value: string) {
  return value.replace(/[%_,]/g, " ");
}

export async function getCustomers(search: string | undefined): Promise<CustomerListResult> {
  const context = await getCustomerBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      return {
        customers: [],
        errorMessage: "Debes iniciar sesion para ver clientes.",
        search: "",
      };
    }

    return {
      customers: [],
      errorMessage: "Completa el onboarding para habilitar clientes.",
      search: "",
    };
  }

  const normalizedSearch = normalizeSearch(search);

  let query = context.supabase
    .from("customers")
    .select("id, name, phone, created_at")
    .eq("business_id", context.businessId)
    .order("created_at", { ascending: false });

  if (normalizedSearch) {
    const term = escapeSupabaseLike(normalizedSearch);
    query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%`);
  }

  const { data, error } = await query;

  if (error) {
    return {
      customers: [],
      errorMessage: "No se pudo cargar la lista de clientes.",
      search: normalizedSearch,
    };
  }

  return {
    customers: data ?? [],
    errorMessage: null,
    search: normalizedSearch,
  };
}

export async function getCustomerDetail(customerId: string): Promise<CustomerDetailResult> {
  const context = await getCustomerBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      return {
        customer: null,
        errorMessage: "Debes iniciar sesion para ver este cliente.",
        history: [],
      };
    }

    return {
      customer: null,
      errorMessage: "Completa el onboarding para habilitar clientes.",
      history: [],
    };
  }

  const { data: customer, error: customerError } = await context.supabase
    .from("customers")
    .select("id, name, phone, notes, last_visit_at, created_at, updated_at")
    .eq("business_id", context.businessId)
    .eq("id", customerId)
    .maybeSingle();

  if (customerError) {
    return {
      customer: null,
      errorMessage: "No se pudo cargar el cliente.",
      history: [],
    };
  }

  if (!customer) {
    return {
      customer: null,
      errorMessage: "Cliente no encontrado.",
      history: [],
    };
  }

  const { data: appointments, error: appointmentsError } = await context.supabase
    .from("appointments")
    .select("id, starts_at, status, service_id")
    .eq("business_id", context.businessId)
    .eq("customer_id", customerId)
    .order("starts_at", { ascending: false })
    .limit(10);

  if (appointmentsError) {
    return {
      customer,
      errorMessage: "Cliente cargado, pero no se pudo leer su historial de citas.",
      history: [],
    };
  }

  const serviceIds = Array.from(
    new Set((appointments ?? []).map((appointment) => appointment.service_id)),
  );
  const serviceMap = new Map<string, string>();

  if (serviceIds.length > 0) {
    const { data: services } = await context.supabase
      .from("services")
      .select("id, name")
      .eq("business_id", context.businessId)
      .in("id", serviceIds);

    for (const service of services ?? []) {
      serviceMap.set(service.id, service.name);
    }
  }

  const history: CustomerHistoryItem[] = (appointments ?? []).map((appointment) => ({
    id: appointment.id,
    serviceName: serviceMap.get(appointment.service_id) ?? "Servicio",
    startsAt: appointment.starts_at,
    status: appointment.status,
  }));

  return {
    customer,
    errorMessage: null,
    history,
  };
}
