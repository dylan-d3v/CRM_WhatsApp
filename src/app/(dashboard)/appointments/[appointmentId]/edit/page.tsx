import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { updateAppointmentAction } from "@/server/appointments/actions";
import {
  APPOINTMENT_STATUSES,
  getAppointmentDetail,
  type AppointmentStatus,
} from "@/server/appointments/queries";

type EditAppointmentPageProps = {
  params: Promise<{
    appointmentId: string;
  }>;
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

function pickString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
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

function toDateTimeLocalDefault(value: string) {
  const date = new Date(value);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone: "America/Guayaquil",
    year: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export default async function EditAppointmentPage({
  params,
  searchParams,
}: EditAppointmentPageProps) {
  const { appointmentId } = await params;
  const { appointment, customers, errorMessage, services } = await getAppointmentDetail(appointmentId);
  const { error } = await searchParams;
  const actionError = pickString(error);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Editar cita</h2>
          <p className="mt-1 text-sm text-slate-600">Actualiza cliente, servicio, fecha/hora, estado o notas.</p>
        </div>
        <Link href="/appointments" className={buttonVariants({ size: "sm", variant: "outline" })}>
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

      {appointment ? (
        <form action={updateAppointmentAction} className="mt-5 space-y-4">
          <input type="hidden" name="appointment_id" value={appointment.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Cliente</span>
              <select
                name="customer_id"
                required
                defaultValue={appointment.customer_id}
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
              >
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
                defaultValue={appointment.service_id}
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.duration_minutes} min{service.is_active ? "" : " - inactivo"})
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
                defaultValue={toDateTimeLocalDefault(appointment.starts_at)}
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Estado</span>
              <select
                name="status"
                defaultValue={appointment.status}
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
              defaultValue={appointment.internal_notes ?? ""}
              name="internal_notes"
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
