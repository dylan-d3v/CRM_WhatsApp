"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  LayoutDashboard,
  MessageCircleMore,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/customers", icon: Users, label: "Clientes" },
  { href: "/services", icon: BriefcaseBusiness, label: "Servicios" },
  { href: null, icon: CalendarDays, label: "Citas" },
  { href: null, icon: MessageCircleMore, label: "WhatsApp" },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

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

        <div className="mx-auto hidden w-full max-w-5xl gap-2 px-4 pb-3 sm:flex sm:px-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = Boolean(
              item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`)),
            );

            if (!item.href) {
              return (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-400"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </span>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 sm:px-6 sm:py-8">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <ul className="mx-auto grid max-w-5xl grid-cols-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = Boolean(
              item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`)),
            );

            if (!item.href) {
              return (
                <li key={item.label}>
                  <span className="flex w-full flex-col items-center gap-1 px-2 py-2 text-xs font-medium text-slate-400">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </span>
                </li>
              );
            }

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex w-full flex-col items-center gap-1 px-2 py-2 text-xs font-medium",
                    isActive ? "text-slate-900" : "text-slate-500",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
