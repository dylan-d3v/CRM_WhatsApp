import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";
import { getSessionStatus } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { MESSAGE_TEMPLATE_LABELS, MESSAGE_TEMPLATE_TYPES } from "@/lib/whatsapp/templates";
import {
  getDashboardData,
  type DashboardAppointmentItem,
  type DashboardRecentCustomerItem,
} from "@/server/dashboard/queries";
import { openWhatsAppForAppointmentAction } from "@/server/whatsapp/actions";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Guayaquil",
  }).format(new Date(value));
}

function formatStatus(status: DashboardAppointmentItem["status"]) {
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

function statusBadgeClass(status: DashboardAppointmentItem["status"]) {
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

function pickString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

function EmptyState({ text }: { text: string }) {
  return (
    <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
      {text}
    </li>
  );
}

function AppointmentItem({ appointment }: { appointment: DashboardAppointmentItem }) {
  return (
    <li className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{appointment.customerName}</p>
          <p className="mt-1 text-sm text-slate-600">
            {appointment.serviceName} - {formatDateTime(appointment.startsAt)}
          </p>
        </div>
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:min-w-56">
          <span
            className={cn(
              "rounded-full px-2 py-1 text-center text-xs font-semibold",
              statusBadgeClass(appointment.status),
            )}
          >
            {formatStatus(appointment.status)}
          </span>
          <form action={openWhatsAppForAppointmentAction} className="flex flex-col gap-2">
            <input type="hidden" name="appointment_id" value={appointment.id} />
            <input type="hidden" name="return_path" value="/dashboard" />
            <select
              name="template_type"
              defaultValue="reminder"
              className="h-9 rounded-md border border-slate-300 px-2 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
            >
              {MESSAGE_TEMPLATE_TYPES.map((templateType) => (
                <option key={templateType} value={templateType}>
                  {MESSAGE_TEMPLATE_LABELS[templateType]}
                </option>
              ))}
            </select>
            <Button size="sm" type="submit" variant="secondary">
              Abrir WhatsApp
            </Button>
          </form>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        En MVP solo se registra la apertura del enlace de WhatsApp.
      </p>
    </li>
  );
}

function CustomerItem({ customer }: { customer: DashboardRecentCustomerItem }) {
  return (
    <li className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">{customer.name}</p>
          <p className="text-sm text-slate-600">{customer.phone}</p>
          <p className="mt-1 text-xs text-slate-500">Registro: {formatDateTime(customer.createdAt)}</p>
        </div>
        <Link href={`/customers/${customer.id}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
          Ver detalle
        </Link>
      </div>
    </li>
  );
}

type DashboardPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const actionError = pickString(params.error);
  const [sessionStatus, dashboardData] = await Promise.all([getSessionStatus(), getDashboardData()]);

  const todayMetrics = [
    { label: "Citas de hoy", value: dashboardData.summary.todayCount.toString() },
    { label: "Proximas citas", value: dashboardData.summary.upcomingCount.toString() },
    { label: "Pendientes", value: dashboardData.summary.pendingCount.toString() },
    { label: "Canceladas", value: dashboardData.summary.cancelledCount.toString() },
  ];

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {todayMetrics.map((metric) => (
          <article key={metric.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{metric.value}</p>
          </article>
        ))}
      </section>

      {dashboardData.errorMessage ? (
        <section className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm sm:p-6">
          <p className="text-sm text-rose-700">{dashboardData.errorMessage}</p>
        </section>
      ) : null}

      {actionError ? (
        <section className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm sm:p-6">
          <p className="text-sm text-rose-700">{actionError}</p>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sesion activa</h2>
            <p className="mt-2 text-sm text-slate-600">
              {sessionStatus.userEmail ?? "Usuario autenticado"}
            </p>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Cerrar sesion
            </Button>
          </form>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Citas de hoy</h2>
            <p className="text-sm text-slate-500">Agenda del dia actual para atender y confirmar.</p>
          </div>
          <Link href="/appointments" className={buttonVariants({ size: "sm" })}>
            Ver agenda completa
          </Link>
        </div>

        <ul className="mt-5 space-y-3">
          {dashboardData.todayAppointments.length === 0 ? (
            <EmptyState text="No hay citas para hoy." />
          ) : (
            dashboardData.todayAppointments.map((appointment) => (
              <AppointmentItem key={appointment.id} appointment={appointment} />
            ))
          )}
        </ul>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Proximas citas</h3>
              <p className="text-sm text-slate-500">Siguientes turnos desde este momento.</p>
            </div>
          </div>

          <ul className="mt-4 space-y-3">
            {dashboardData.upcomingAppointments.length === 0 ? (
              <EmptyState text="No hay proximas citas registradas." />
            ) : (
              dashboardData.upcomingAppointments.map((appointment) => (
                <AppointmentItem key={appointment.id} appointment={appointment} />
              ))
            )}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="text-base font-bold text-slate-900">Clientes recientes</h3>
          <p className="mt-1 text-sm text-slate-500">Ultimos clientes registrados en el negocio.</p>

          <ul className="mt-4 space-y-3">
            {dashboardData.recentCustomers.length === 0 ? (
              <EmptyState text="Aun no hay clientes recientes." />
            ) : (
              dashboardData.recentCustomers.map((customer) => (
                <CustomerItem key={customer.id} customer={customer} />
              ))
            )}
          </ul>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-base font-bold text-slate-900">Pendientes y canceladas</h3>
        <p className="mt-1 text-sm text-slate-500">
          Citas desde hoy que requieren seguimiento comercial u operativo.
        </p>

        <ul className="mt-4 space-y-3">
          {dashboardData.pendingCancelledAppointments.length === 0 ? (
            <EmptyState text="No hay citas pendientes o canceladas para seguimiento." />
          ) : (
            dashboardData.pendingCancelledAppointments.map((appointment) => (
              <AppointmentItem key={appointment.id} appointment={appointment} />
            ))
          )}
        </ul>
      </section>
    </>
  );
}
