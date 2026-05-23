"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCustomerBusinessContext } from "@/server/customers/context";

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

export async function createCustomerAction(formData: FormData) {
  const context = await getCustomerBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      redirect("/login");
    }

    redirectWithError("/onboarding", "Completa el onboarding antes de crear clientes.");
  }

  const name = readTextField(formData, "name");
  const phone = readTextField(formData, "phone");
  const notes = readTextField(formData, "notes");

  if (!name || !phone) {
    redirectWithError("/customers", "Nombre y telefono son obligatorios.");
  }

  const { error } = await context.supabase.from("customers").insert({
    business_id: context.businessId,
    name,
    notes: notes || null,
    phone,
  });

  if (error) {
    redirectWithError("/customers", "No se pudo crear el cliente.");
  }

  revalidatePath("/customers");
  redirectWithSuccess("/customers", "Cliente creado.");
}

export async function updateCustomerAction(formData: FormData) {
  const context = await getCustomerBusinessContext();

  if (!context.ok) {
    if (context.reason === "not_authenticated") {
      redirect("/login");
    }

    redirectWithError("/onboarding", "Completa el onboarding antes de editar clientes.");
  }

  const customerId = readTextField(formData, "customer_id");
  const name = readTextField(formData, "name");
  const phone = readTextField(formData, "phone");
  const notes = readTextField(formData, "notes");

  if (!customerId || !name || !phone) {
    redirectWithError("/customers", "Nombre, telefono y cliente son obligatorios.");
  }

  const { data, error } = await context.supabase
    .from("customers")
    .update({
      name,
      notes: notes || null,
      phone,
    })
    .eq("business_id", context.businessId)
    .eq("id", customerId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    redirectWithError(`/customers/${customerId}/edit`, "No se pudo actualizar el cliente.");
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  revalidatePath(`/customers/${customerId}/edit`);
  redirectWithSuccess(`/customers/${customerId}`, "Cliente actualizado.");
}
