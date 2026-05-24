import { getSettingsBusinessContext } from "@/server/settings/context";

export const DEFAULT_BUSINESS_TIMEZONE = "America/Guayaquil";

export type BusinessSettings = {
  created_at: string;
  id: string;
  name: string;
  phone: string | null;
  slug: string;
  timezone: string;
};

export type BusinessSettingsResult = {
  errorMessage: string | null;
  settings: BusinessSettings | null;
};

export async function getBusinessSettings(): Promise<BusinessSettingsResult> {
  const context = await getSettingsBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      return {
        errorMessage: "Debes iniciar sesion para ver la configuracion.",
        settings: null,
      };
    }

    return {
      errorMessage: "Completa el onboarding para habilitar la configuracion del negocio.",
      settings: null,
    };
  }

  const { data, error } = await context.supabase
    .from("businesses")
    .select("id, name, phone, timezone, slug, created_at")
    .eq("id", context.businessId)
    .maybeSingle();

  if (error || !data) {
    return {
      errorMessage: "No se pudo cargar la configuracion del negocio.",
      settings: null,
    };
  }

  return {
    errorMessage: null,
    settings: data,
  };
}
