import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createCustomerAction } from "@/server/customers/actions";
import { getCustomers } from "@/server/customers/queries";

type CustomersPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    q?: string | string[];
    success?: string | string[];
  }>;
};

function pickString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const search = pickString(params.q) ?? "";
  const { customers, errorMessage, search: normalizedSearch } = await getCustomers(search);
  const actionError = pickString(params.error);
  const actionSuccess = pickString(params.success);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-900">Clientes</h2>
        <p className="mt-1 text-sm text-slate-600">
          Registra y consulta clientes para mantener historial por negocio.
        </p>

        {errorMessage ? (
          <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}

        {actionError ? (
          <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {actionError}
          </p>
        ) : null}

        {actionSuccess ? (
          <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {actionSuccess}
          </p>
        ) : null}

        <form className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            defaultValue={normalizedSearch}
            name="q"
            placeholder="Buscar por nombre o telefono"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
          />
          <Button type="submit" variant="outline">
            Buscar
          </Button>
          <Link
            href="/customers"
            className={cn(buttonVariants({ variant: "secondary" }), "w-full sm:w-auto")}
          >
            Limpiar
          </Link>
        </form>

        <ul className="mt-5 space-y-3">
          {customers.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              {normalizedSearch ? (
                <>
                  No encontramos clientes con <strong>&quot;{normalizedSearch}&quot;</strong>. Prueba otro
                  termino o limpia la busqueda.
                </>
              ) : (
                "Aun no tienes clientes registrados. Usa el formulario de abajo para crear el primero."
              )}
            </li>
          ) : (
            customers.map((customer) => (
              <li key={customer.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{customer.name}</p>
                    <p className="text-sm text-slate-600">{customer.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/customers/${customer.id}`}
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                    >
                      Ver detalle
                    </Link>
                    <Link href={`/customers/${customer.id}/edit`} className={buttonVariants({ size: "sm" })}>
                      Editar
                    </Link>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-base font-bold text-slate-900">Nuevo cliente</h3>
        <p className="mt-1 text-sm text-slate-600">Nombre y telefono son obligatorios.</p>

        <form action={createCustomerAction} className="mt-4 space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Nombre</span>
            <input
              name="name"
              required
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Telefono</span>
            <input
              name="phone"
              type="tel"
              required
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Notas (opcional)</span>
            <textarea
              name="notes"
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
            />
          </label>

          <Button type="submit" className="w-full sm:w-auto">
            Guardar cliente
          </Button>
        </form>
      </section>
    </div>
  );
}
