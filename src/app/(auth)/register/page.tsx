import Link from "next/link";

import { Button } from "@/components/ui/button";
import { registerAction } from "@/lib/auth/actions";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

function getErrorMessage(error: string | string[] | undefined) {
  return typeof error === "string" ? error : null;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;
  const errorMessage = getErrorMessage(error);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          CRM de Citas
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Crear cuenta</h1>
        <p className="mt-2 text-sm text-slate-600">
          Registra tu negocio y empieza a ordenar citas en minutos.
        </p>
      </div>

      {errorMessage ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      <form action={registerAction} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Correo</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Contrasena</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Confirmar contrasena</span>
          <input
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
          />
        </label>

        <Button type="submit" className="w-full">
          Crear cuenta
        </Button>
      </form>

      <p className="text-sm text-slate-600">
        Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-slate-900 underline decoration-slate-300">
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}
