import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser, hasCompletedOnboarding } from "@/lib/auth/user";

type AuthLayoutProps = {
  children: ReactNode;
};

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect(hasCompletedOnboarding(user) ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </main>
  );
}
