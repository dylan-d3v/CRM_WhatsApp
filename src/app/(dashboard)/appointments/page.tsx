import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  changeAppointmentStatusAction,
  createAppointmentAction,
} from "@/server/appointments/actions";
import {
  APPOINTMENT_STATUSES,
  getAppointmentsByDate,
  getTodayInGuayaquil,
  type AppointmentStatus,
} from "@/server/appointments/queries";

type AppointmentsPageProps = {
  searchParams: Promise<{
    date?: string | string[];
    error?: string | string[];
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
    timeZone: "America/Guayaquil",
  }).format(new Date(value));
}

function formatStatus(status: AppointmentStatus) {
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

function statusBadgeClass(status: AppointmentStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "confirmed":
      return "bg-sky-100 text-sky-800";
    case "completed":
      return "bg-emerald-100 text-emerald-800";
    case "cancelled":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-slate-200 text-slate-700";
  }
}

export default async function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
  const params = await searchParams;
  const selectedDate = pickString(params.date) ?? getTodayInGuayaquil();
  const { appointments, customers, date, errorMessage, services } = await getAppointmentsByDate(selectedDate);
  const actionError = pickString(params.error);
  const actionSuccess = pickString(params.success);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-900">Citas</h2>
        <p className="mt-1 text-sm text-slate-600">
          Gestiona la agenda diaria por fecha, estado, cliente y servicio.
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

        <form className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="block w-full space-y-1 sm:max-w-xs">
            <span className="text-sm font-medium text-slate-700">Fecha</span>
            <input
              defaultValue={date}
              name="date"
              type="date"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
            />
          </label>
          <Button type="submit" variant="outline">
            Ver agenda
          </Button>
          <Link href="/appointments" className={cn(buttonVariants({ variant: "secondary" }), "w-full sm:w-auto")}>
            Hoy
          </Link>
        </form>

        <ul className="mt-5 space-y-3">
          {appointments.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              No hay citas para la fecha seleccionada.
            </li>
          ) : (
            appointments.map((appointment) => (
              <li key={appointment.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{appointment.customerName}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {appointment.serviceName} - {formatDateTime(appointment.startsAt)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Fin estimado: {formatDateTime(appointment.endsAt)}</p>
                    {appointment.internalNotes ? (
                      <p className="mt-2 text-sm text-slate-700">{appointment.internalNotes}</p>
                    ) : null}
                    <p className="mt-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-semibold",
                          statusBadgeClass(appointment.status),
                        )}
                      >
                        {formatStatus(appointment.status)}
                      </span>
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:w-auto">
                    <Link
                      href={`/appointments/${appointment.id}/edit`}
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                    >
                      Editar cita
                    </Link>
                    <form action={changeAppointmentStatusAction} className="flex flex-col gap-2 sm:min-w-48">
                      <input type="hidden" name="appointment_id" value={appointment.id} />
                      <input type="hidden" name="redirect_date" value={date} />
                      <select
                        name="status"
                        defaultValue={appointment.status}
                        className="h-9 rounded-md border border-slate-300 px-2 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
                      >
                        {APPOINTMENT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {formatStatus(status)}
                          </option>
                        ))}
                      </select>
                      <Button size="sm" type="submit">
                        Actualizar estado
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
        <h3 className="text-base font-bold text-slate-900">Nueva cita</h3>
        <p className="mt-1 text-sm text-slate-600">
          Selecciona cliente, servicio activo y hora para registrar la cita.
        </p>

        <form action={createAppointmentAction} className="mt-4 space-y-4">
          <input type="hidden" name="redirect_date" value={date} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Cliente</span>
              <select
                name="customer_id"
                required
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
              >
                <option value="">Selecciona un cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Servicio</span>
              <select
                name="service_id"
                required
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
              >
                <option value="">Selecciona un servicio</option>
                {services
                  .filter((service) => service.is_active)
                  .map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration_minutes} min)
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Inicio</span>
              <input
                name="starts_at"
                type="datetime-local"
                required
                defaultValue={`${date}T09:00`}
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Estado</span>
              <select
                name="status"
                defaultValue="pending"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
              >
                {APPOINTMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Notas internas (opcional)</span>
            <textarea
              name="internal_notes"
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
            />
          </label>

          <Button type="submit" className="w-full sm:w-auto">
            Guardar cita
          </Button>
        </form>

        {customers.length === 0 ? (
          <p className="mt-3 text-sm text-amber-700">Necesitas al menos un cliente para crear citas.</p>
        ) : null}

        {services.filter((service) => service.is_active).length === 0 ? (
          <p className="mt-2 text-sm text-amber-700">
            Necesitas al menos un servicio activo para crear citas.
          </p>
        ) : null}
      </section>
    </div>
  );
}
