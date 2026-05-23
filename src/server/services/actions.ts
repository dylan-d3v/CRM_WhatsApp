"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getServiceBusinessContext } from "@/server/services/context";

function readTextField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function readPositiveIntegerField(formData: FormData, name: string) {
  const rawValue = readTextField(formData, name);
  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

function readPriceField(formData: FormData, name: string) {
  const rawValue = readTextField(formData, name).replace(",", ".");
  const parsedValue = Number.parseFloat(rawValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
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

export async function createServiceAction(formData: FormData) {
  const context = await getServiceBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      redirect("/login");
    }

    redirectWithError("/onboarding", "Completa el onboarding antes de crear servicios.");
  }

  const name = readTextField(formData, "name");
  const durationMinutes = readPositiveIntegerField(formData, "duration_minutes");
  const price = readPriceField(formData, "price");

  if (!name || durationMinutes === null || price === null) {
    redirectWithError("/services", "Nombre, duracion y precio validos son obligatorios.");
  }

  const { error } = await context.supabase.from("services").insert({
    business_id: context.businessId,
    duration_minutes: durationMinutes,
    name,
    price,
  });

  if (error) {
    redirectWithError("/services", "No se pudo crear el servicio.");
  }

  revalidatePath("/services");
  redirectWithSuccess("/services", "Servicio creado.");
}

export async function updateServiceAction(formData: FormData) {
  const context = await getServiceBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      redirect("/login");
    }

    redirectWithError("/onboarding", "Completa el onboarding antes de editar servicios.");
  }

  const serviceId = readTextField(formData, "service_id");
  const name = readTextField(formData, "name");
  const durationMinutes = readPositiveIntegerField(formData, "duration_minutes");
  const price = readPriceField(formData, "price");
  const isActive = formData.get("is_active") === "on";

  if (!serviceId || !name || durationMinutes === null || price === null) {
    redirectWithError("/services", "Nombre, duracion, precio y servicio son obligatorios.");
  }

  const { data, error } = await context.supabase
    .from("services")
    .update({
      duration_minutes: durationMinutes,
      is_active: isActive,
      name,
      price,
    })
    .eq("business_id", context.businessId)
    .eq("id", serviceId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    redirectWithError(`/services/${serviceId}/edit`, "No se pudo actualizar el servicio.");
  }

  revalidatePath("/services");
  revalidatePath(`/services/${serviceId}/edit`);
  redirectWithSuccess("/services", "Servicio actualizado.");
}

export async function toggleServiceActiveAction(formData: FormData) {
  const context = await getServiceBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      redirect("/login");
    }

    redirectWithError("/onboarding", "Completa el onboarding antes de actualizar servicios.");
  }

  const serviceId = readTextField(formData, "service_id");
  const nextState = readTextField(formData, "next_state");

  if (!serviceId || (nextState !== "active" && nextState !== "inactive")) {
    redirectWithError("/services", "No se pudo actualizar el estado del servicio.");
  }

  const { data, error } = await context.supabase
    .from("services")
    .update({
      is_active: nextState === "active",
    })
    .eq("business_id", context.businessId)
    .eq("id", serviceId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    redirectWithError("/services", "No se pudo cambiar el estado del servicio.");
  }

  revalidatePath("/services");
  redirectWithSuccess(
    "/services",
    nextState === "active" ? "Servicio activado." : "Servicio desactivado.",
  );
}
