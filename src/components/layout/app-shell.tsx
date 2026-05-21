import type { ReactNode } from "react";
import { CalendarDays, LayoutDashboard, MessageCircleMore, Users } from "lucide-react";

import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Clientes", icon: Users, active: false },
  { label: "Citas", icon: CalendarDays, active: false },
  { label: "WhatsApp", icon: MessageCircleMore, active: false },
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              CRM de Citas
            </p>
            <h1 className="text-base font-bold text-slate-900 sm:text-lg">
              WhatsApp para negocios locales
            </h1>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Demo MVP
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 sm:px-6 sm:py-8">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <ul className="mx-auto grid max-w-5xl grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full flex-col items-center gap-1 px-2 py-2 text-xs font-medium",
                    item.active ? "text-slate-900" : "text-slate-500",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
