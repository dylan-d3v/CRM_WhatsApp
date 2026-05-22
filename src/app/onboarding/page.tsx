import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { completeOnboardingAction } from "@/lib/auth/actions";
import { getCurrentUser, hasCompletedOnboarding } from "@/lib/auth/user";

type OnboardingPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

function getErrorMessage(error: string | string[] | undefined) {
  return typeof error === "string" ? error : null;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (hasCompletedOnboarding(user)) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;
  const errorMessage = getErrorMessage(error);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <section className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Primer paso</p>
          <h1 className="text-2xl font-bold text-slate-900">Configura tu negocio</h1>
          <p className="text-sm text-slate-600">
            Esto habilita tu dashboard inicial para que puedas empezar a agendar citas.
          </p>
          <p className="text-xs text-slate-500">Cuenta: {user.email ?? "usuario autenticado"}</p>
        </div>

        {errorMessage ? (
          <p className="mt-5 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}

        <form action={completeOnboardingAction} className="mt-5 space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Nombre del negocio</span>
            <input
              name="business_name"
              required
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Telefono (opcional)</span>
            <input
              name="business_phone"
              type="tel"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
            />
          </label>

          <Button type="submit" className="w-full">
            Guardar y continuar
          </Button>
        </form>
      </section>
    </main>
  );
}
