import { Button } from "@/components/ui/button";
import { getSessionStatus } from "@/lib/auth/session";
import { updateBusinessSettingsAction } from "@/server/settings/actions";
import {
  DEFAULT_BUSINESS_TIMEZONE,
  getBusinessSettings,
} from "@/server/settings/queries";

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    success?: string | string[];
  }>;
};

function pickString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

function formatCreatedDate(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeZone: DEFAULT_BUSINESS_TIMEZONE,
  }).format(new Date(value));
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const actionError = pickString(params.error);
  const actionSuccess = pickString(params.success);
  const [{ settings, errorMessage }, sessionStatus] = await Promise.all([
    getBusinessSettings(),
    getSessionStatus(),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-900">Configuracion del negocio</h2>
        <p className="mt-1 text-sm text-slate-600">
          Ajusta los datos basicos usados en dashboard, citas y plantillas de WhatsApp.
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

        {settings ? (
          <form action={updateBusinessSettingsAction} className="mt-4 space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Nombre del negocio</span>
              <input
                name="business_name"
                defaultValue={settings.name}
                required
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Telefono de contacto</span>
              <input
                name="business_phone"
                type="tel"
                defaultValue={settings.phone ?? ""}
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Zona horaria</span>
              <select
                name="business_timezone"
                defaultValue={settings.timezone}
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none ring-slate-500 transition focus:ring-2"
              >
                <option value={DEFAULT_BUSINESS_TIMEZONE}>America/Guayaquil (MVP)</option>
              </select>
            </label>

            <Button type="submit" className="w-full sm:w-auto">
              Guardar configuracion
            </Button>
          </form>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-base font-bold text-slate-900">Datos operativos</h3>
        <p className="mt-1 text-sm text-slate-600">
          Referencia rapida para demo y soporte inicial con negocios locales.
        </p>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="font-medium text-slate-700">Correo de sesion</dt>
            <dd className="mt-1 text-slate-600">{sessionStatus.userEmail ?? "Usuario autenticado"}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="font-medium text-slate-700">Slug del negocio</dt>
            <dd className="mt-1 text-slate-600">{settings?.slug ?? "No disponible"}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="font-medium text-slate-700">Alta del negocio</dt>
            <dd className="mt-1 text-slate-600">
              {settings ? formatCreatedDate(settings.created_at) : "No disponible"}
            </dd>
          </div>
        </dl>

        <p className="mt-4 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700">
          En MVP el sistema registra solo &quot;WhatsApp abierto&quot;, no confirma envio real del mensaje.
        </p>
      </section>
    </div>
  );
}
