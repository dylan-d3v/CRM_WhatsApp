import { getServiceBusinessContext } from "@/server/services/context";

export type ServiceListItem = {
  created_at: string;
  duration_minutes: number;
  id: string;
  is_active: boolean;
  name: string;
  price: number;
};

export type ServiceDetail = {
  created_at: string;
  duration_minutes: number;
  id: string;
  is_active: boolean;
  name: string;
  price: number;
};

export type ServiceListResult = {
  errorMessage: string | null;
  services: ServiceListItem[];
};

export type ServiceDetailResult = {
  errorMessage: string | null;
  service: ServiceDetail | null;
};

export type ActiveServiceResult = {
  errorMessage: string | null;
  services: Array<Pick<ServiceListItem, "duration_minutes" | "id" | "name" | "price">>;
};

export async function getServices(): Promise<ServiceListResult> {
  const context = await getServiceBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      return {
        errorMessage: "Debes iniciar sesion para ver servicios.",
        services: [],
      };
    }

    return {
      errorMessage: "Completa el onboarding para habilitar servicios.",
      services: [],
    };
  }

  const { data, error } = await context.supabase
    .from("services")
    .select("id, name, duration_minutes, price, is_active, created_at")
    .eq("business_id", context.businessId)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return {
      errorMessage: "No se pudo cargar la lista de servicios.",
      services: [],
    };
  }

  return {
    errorMessage: null,
    services: data ?? [],
  };
}

export async function getServiceDetail(serviceId: string): Promise<ServiceDetailResult> {
  const context = await getServiceBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      return {
        errorMessage: "Debes iniciar sesion para ver este servicio.",
        service: null,
      };
    }

    return {
      errorMessage: "Completa el onboarding para habilitar servicios.",
      service: null,
    };
  }

  const { data, error } = await context.supabase
    .from("services")
    .select("id, name, duration_minutes, price, is_active, created_at")
    .eq("business_id", context.businessId)
    .eq("id", serviceId)
    .maybeSingle();

  if (error) {
    return {
      errorMessage: "No se pudo cargar el servicio.",
      service: null,
    };
  }

  if (!data) {
    return {
      errorMessage: "Servicio no encontrado.",
      service: null,
    };
  }

  return {
    errorMessage: null,
    service: data,
  };
}

export async function getActiveServices(): Promise<ActiveServiceResult> {
  const context = await getServiceBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      return {
        errorMessage: "Debes iniciar sesion para ver servicios activos.",
        services: [],
      };
    }

    return {
      errorMessage: "Completa el onboarding para habilitar servicios activos.",
      services: [],
    };
  }

  const { data, error } = await context.supabase
    .from("services")
    .select("id, name, duration_minutes, price")
    .eq("business_id", context.businessId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      errorMessage: "No se pudo cargar los servicios activos.",
      services: [],
    };
  }

  return {
    errorMessage: null,
    services: data ?? [],
  };
}
