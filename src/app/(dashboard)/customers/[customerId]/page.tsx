import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getCustomerDetail } from "@/server/customers/queries";

type CustomerDetailPageProps = {
  params: Promise<{
    customerId: string;
  }>;
  searchParams: Promise<{
    success?: string | string[];
  }>;
};

function pickString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatus(status: string) {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "confirmed":
      return "Confirmada";
    case "completed":
      return "Completada";
    case "cancelled":
      return "Cancelada";
    default:
      return status;
  }
}

export default async function CustomerDetailPage({
  params,
  searchParams,
}: CustomerDetailPageProps) {
  const { customerId } = await params;
  const { customer, errorMessage, history } = await getCustomerDetail(customerId);
  const { success } = await searchParams;
  const successMessage = pickString(success);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Detalle de cliente</h2>
            <p className="mt-1 text-sm text-slate-600">
              Informacion principal e historial reciente de citas.
            </p>
          </div>
          <div className="flex gap-2">
            {customer ? (
              <Link href={`/customers/${customer.id}/edit`} className={buttonVariants({ size: "sm" })}>
                Editar
              </Link>
            ) : null}
            <Link href="/customers" className={buttonVariants({ size: "sm", variant: "outline" })}>
              Volver
            </Link>
          </div>
        </div>

        {successMessage ? (
          <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}

        {customer ? (
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nombre</dt>
              <dd className="mt-1 text-sm text-slate-900">{customer.name}</dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Telefono</dt>
              <dd className="mt-1 text-sm text-slate-900">{customer.phone}</dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notas</dt>
              <dd className="mt-1 text-sm text-slate-900">{customer.notes?.trim() || "Sin notas"}</dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Creado</dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDateTime(customer.created_at)}</dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ultima actualizacion
              </dt>
              <dd className="mt-1 text-sm text-slate-900">{formatDateTime(customer.updated_at)}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-base font-bold text-slate-900">Historial de citas</h3>
        <p className="mt-1 text-sm text-slate-600">Ultimas 10 citas registradas para este cliente.</p>

        <ul className="mt-4 space-y-3">
          {history.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Sin citas registradas aun.
            </li>
          ) : (
            history.map((item) => (
              <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{item.serviceName}</p>
                  <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
                    {formatStatus(item.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{formatDateTime(item.startsAt)}</p>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
