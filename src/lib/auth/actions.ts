"use server";

import { redirect } from "next/navigation";

import { hasCompletedOnboarding } from "@/lib/auth/user";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function readField(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function withError(path: string, message: string) {
  return `${path}?error=${encodeURIComponent(message)}`;
}

function describeSupabaseError(error: { message: string; code?: string; details?: string; hint?: string }) {
  return [error.message, error.code, error.details, error.hint].filter(Boolean).join(" ");
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function buildUniqueBusinessSlug(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  businessName: string,
) {
  const base = toSlug(businessName) || "negocio";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = attempt === 0 ? Date.now().toString(36) : crypto.randomUUID().slice(0, 6);
    const candidate = `${base}-${suffix}`;

    const { data, error } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", candidate)
      .limit(1);

    if (error) {
      return candidate;
    }

    if (!data || data.length === 0) {
      return candidate;
    }
  }

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

async function upsertOwnerBusiness(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
  businessName: string,
  businessPhone: string,
) {
  const { data: ownedBusinesses, error: ownedBusinessesError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (ownedBusinessesError) {
    return ownedBusinessesError;
  }

  if (ownedBusinesses && ownedBusinesses.length > 0) {
    const { error } = await supabase
      .from("businesses")
      .update({
        name: businessName,
        phone: businessPhone || null,
      })
      .eq("id", ownedBusinesses[0].id);

    return error;
  }

  const slug = await buildUniqueBusinessSlug(supabase, businessName);
  const { error } = await supabase.from("businesses").insert({
    name: businessName,
    owner_user_id: userId,
    phone: businessPhone || null,
    slug,
  });

  return error;
}

export async function loginAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect(withError("/login", "Configura las variables de Supabase para continuar."));
  }

  const email = readField(formData, "email");
  const password = readField(formData, "password");

  if (!email || !password) {
    redirect(withError("/login", "Ingresa correo y contrasena."));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(withError("/login", error.message));
  }

  redirect(hasCompletedOnboarding(data.user) ? "/dashboard" : "/onboarding");
}

export async function registerAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect(withError("/register", "Configura las variables de Supabase para continuar."));
  }

  const email = readField(formData, "email");
  const password = readField(formData, "password");
  const confirmPassword = readField(formData, "confirm_password");

  if (!email || !password) {
    redirect(withError("/register", "Ingresa correo y contrasena."));
  }

  if (password.length < 6) {
    redirect(withError("/register", "La contrasena debe tener al menos 6 caracteres."));
  }

  if (password !== confirmPassword) {
    redirect(withError("/register", "Las contrasenas no coinciden."));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect(withError("/register", error.message));
  }

  if (!data.session) {
    redirect("/login?error=Revisa tu correo para confirmar la cuenta antes de iniciar sesion.");
  }

  redirect("/onboarding");
}

export async function completeOnboardingAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect(withError("/onboarding", "Configura las variables de Supabase para continuar."));
  }

  const businessName = readField(formData, "business_name");
  const businessPhone = readField(formData, "business_phone");

  if (!businessName) {
    redirect(withError("/onboarding", "Ingresa el nombre de tu negocio."));
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const businessError = await upsertOwnerBusiness(supabase, user.id, businessName, businessPhone);

  if (businessError) {
    console.error("Business onboarding error:", businessError);
    redirect(withError("/onboarding", describeSupabaseError(businessError)));
  }

  const { error: userUpdateError } = await supabase.auth.updateUser({
    data: {
      business_name: businessName,
      business_phone: businessPhone || null,
    },
  });

  if (userUpdateError) {
    redirect(withError("/onboarding", userUpdateError.message));
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  redirect("/login");
}
