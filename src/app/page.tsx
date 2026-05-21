import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

const todayMetrics = [
  { label: "Citas de hoy", value: "12" },
  { label: "Confirmadas", value: "7" },
  { label: "Pendientes", value: "3" },
  { label: "Canceladas", value: "2" },
];

const upcomingAppointments = [
  { time: "09:00", customer: "Mariana P.", service: "Corte + lavado", status: "Confirmada" },
  { time: "10:30", customer: "Carlos M.", service: "Barba premium", status: "Pendiente" },
  { time: "12:00", customer: "Sofia G.", service: "Tinte completo", status: "Confirmada" },
];

export default function Home() {
  return (
    <AppShell>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {todayMetrics.map((metric) => (
          <article key={metric.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{metric.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Proximas citas</h2>
            <p className="text-sm text-slate-500">
              Base visual lista para conectar datos reales en los siguientes modulos.
            </p>
          </div>
          <Button size="sm">Nueva cita</Button>
        </div>

        <ul className="mt-5 space-y-3">
          {upcomingAppointments.map((appointment) => (
            <li
              key={`${appointment.time}-${appointment.customer}`}
              className="rounded-lg border border-slate-100 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{appointment.customer}</p>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                  {appointment.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {appointment.time} - {appointment.service}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
