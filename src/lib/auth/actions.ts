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

  const { error } = await supabase.auth.updateUser({
    data: {
      business_name: businessName,
      business_phone: businessPhone || null,
    },
  });

  if (error) {
    redirect(withError("/onboarding", error.message));
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
