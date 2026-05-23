import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { updateServiceAction } from "@/server/services/actions";
import { getServiceDetail } from "@/server/services/queries";

type EditServicePageProps = {
  params: Promise<{
    serviceId: string;
  }>;
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

function pickString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

export default async function EditServicePage({ params, searchParams }: EditServicePageProps) {
  const { serviceId } = await params;
  const { service, errorMessage } = await getServiceDetail(serviceId);
  const { error } = await searchParams;
  const actionError = pickString(error);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Editar servicio</h2>
          <p className="mt-1 text-sm text-slate-600">Actualiza nombre, duracion, precio o estado.</p>
        </div>
        <Link href="/services" className={buttonVariants({ size: "sm", variant: "outline" })}>
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

      {service ? (
        <form action={updateServiceAction} className="mt-5 space-y-4">
          <input type="hidden" name="service_id" value={service.id} />

          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Nombre</span>
            <input
              defaultValue={service.name}
              name="name"
              required
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Duracion (minutos)</span>
              <input
                defaultValue={service.duration_minutes}
                name="duration_minutes"
                min={1}
                required
                step={1}
                type="number"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Precio (USD)</span>
              <input
                defaultValue={service.price}
                name="price"
                min={0}
                required
                step="0.01"
                type="number"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <input
              defaultChecked={service.is_active}
              name="is_active"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            <span className="text-sm text-slate-700">Servicio activo para nuevas citas</span>
          </label>

          <Button type="submit" className="w-full sm:w-auto">
            Guardar cambios
          </Button>
        </form>
      ) : null}
    </section>
  );
}
