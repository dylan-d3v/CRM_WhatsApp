import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createServiceAction, toggleServiceActiveAction } from "@/server/services/actions";
import { getServices } from "@/server/services/queries";

type ServicesPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    success?: string | string[];
  }>;
};

function pickString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-EC", {
    currency: "USD",
    minimumFractionDigits: 2,
    style: "currency",
  }).format(price);
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { services, errorMessage } = await getServices();
  const params = await searchParams;
  const actionError = pickString(params.error);
  const actionSuccess = pickString(params.success);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-900">Servicios</h2>
        <p className="mt-1 text-sm text-slate-600">
          Crea servicios y controla cuales quedan disponibles para citas.
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

        <ul className="mt-5 space-y-3">
          {services.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Aun no tienes servicios registrados. Crea al menos uno para poder agendar citas.
            </li>
          ) : (
            services.map((service) => (
              <li key={service.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{service.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {service.duration_minutes} min - {formatPrice(service.price)}
                    </p>
                    <p className="mt-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-semibold",
                          service.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-700",
                        )}
                      >
                        {service.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/services/${service.id}/edit`} className={buttonVariants({ size: "sm" })}>
                      Editar
                    </Link>
                    <form action={toggleServiceActiveAction}>
                      <input type="hidden" name="service_id" value={service.id} />
                      <input
                        type="hidden"
                        name="next_state"
                        value={service.is_active ? "inactive" : "active"}
                      />
                      <Button type="submit" size="sm" variant="outline">
                        {service.is_active ? "Desactivar" : "Activar"}
                      </Button>
                    </form>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-base font-bold text-slate-900">Nuevo servicio</h3>
        <p className="mt-1 text-sm text-slate-600">
          Solo servicios activos se usaran al crear citas en el siguiente modulo.
        </p>

        <form action={createServiceAction} className="mt-4 space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Nombre</span>
            <input
              name="name"
              required
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Duracion (minutos)</span>
              <input
                name="duration_minutes"
                type="number"
                min={1}
                step={1}
                required
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Precio (USD)</span>
              <input
                name="price"
                type="number"
                min={0}
                step="0.01"
                required
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
              />
            </label>
          </div>

          <Button type="submit" className="w-full sm:w-auto">
            Guardar servicio
          </Button>
        </form>
      </section>
    </div>
  );
}
