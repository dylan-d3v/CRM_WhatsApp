import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser, hasCompletedOnboarding } from "@/lib/auth/user";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!hasCompletedOnboarding(user)) {
    redirect("/onboarding");
  }

  return <AppShell>{children}</AppShell>;
}
