import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { updateCustomerAction } from "@/server/customers/actions";
import { getCustomerDetail } from "@/server/customers/queries";

type EditCustomerPageProps = {
  params: Promise<{
    customerId: string;
  }>;
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

function pickString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

export default async function EditCustomerPage({ params, searchParams }: EditCustomerPageProps) {
  const { customerId } = await params;
  const { customer, errorMessage } = await getCustomerDetail(customerId);
  const { error } = await searchParams;
  const actionError = pickString(error);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Editar cliente</h2>
          <p className="mt-1 text-sm text-slate-600">Actualiza nombre, telefono o notas.</p>
        </div>
        <Link
          href={customer ? `/customers/${customer.id}` : "/customers"}
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          Volver
        </Link>
      </div>

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

      {customer ? (
        <form action={updateCustomerAction} className="mt-5 space-y-4">
          <input type="hidden" name="customer_id" value={customer.id} />

          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Nombre</span>
            <input
              defaultValue={customer.name}
              name="name"
              required
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Telefono</span>
            <input
              defaultValue={customer.phone}
              name="phone"
              type="tel"
              required
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Notas (opcional)</span>
            <textarea
              defaultValue={customer.notes ?? ""}
              name="notes"
              rows={4}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
            />
          </label>

          <Button type="submit" className="w-full sm:w-auto">
            Guardar cambios
          </Button>
        </form>
      ) : null}
    </section>
  );
}
