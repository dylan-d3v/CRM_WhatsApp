import { redirect } from "next/navigation";

import { getCurrentUser, hasCompletedOnboarding } from "@/lib/auth/user";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect(hasCompletedOnboarding(user) ? "/dashboard" : "/onboarding");
}
