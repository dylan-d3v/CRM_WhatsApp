"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSettingsBusinessContext } from "@/server/settings/context";
import { DEFAULT_BUSINESS_TIMEZONE } from "@/server/settings/queries";

function readTextField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function withParams(path: string, values: Record<string, string>) {
  const params = new URLSearchParams(values);
  return `${path}?${params.toString()}`;
}

function redirectWithError(path: string, message: string): never {
  redirect(withParams(path, { error: message }));
}

function redirectWithSuccess(path: string, message: string): never {
  redirect(withParams(path, { success: message }));
}

export async function updateBusinessSettingsAction(formData: FormData) {
  const context = await getSettingsBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      redirect("/login");
    }

    redirectWithError("/onboarding", "Completa el onboarding antes de editar configuracion.");
  }

  const businessName = readTextField(formData, "business_name");
  const businessPhone = readTextField(formData, "business_phone");
  const businessTimezone = readTextField(formData, "business_timezone");

  if (!businessName) {
    redirectWithError("/settings", "El nombre del negocio es obligatorio.");
  }

  const timezone = businessTimezone || DEFAULT_BUSINESS_TIMEZONE;
  if (timezone !== DEFAULT_BUSINESS_TIMEZONE) {
    redirectWithError("/settings", "En este MVP la zona horaria debe mantenerse en America/Guayaquil.");
  }

  const { data, error } = await context.supabase
    .from("businesses")
    .update({
      name: businessName,
      phone: businessPhone || null,
      timezone,
    })
    .eq("id", context.businessId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    redirectWithError("/settings", "No se pudo guardar la configuracion del negocio.");
  }

  const { error: metadataError } = await context.supabase.auth.updateUser({
    data: {
      business_name: businessName,
      business_phone: businessPhone || null,
    },
  });

  if (metadataError) {
    redirectWithError(
      "/settings",
      "La configuracion se guardo, pero no se pudo sincronizar tu perfil. Intenta nuevamente.",
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  redirectWithSuccess("/settings", "Configuracion del negocio actualizada.");
}
