import { cache } from "react";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/user";

export type SessionStatus = {
  isConfigured: boolean;
  isAuthenticated: boolean;
  userEmail: string | null;
};

export const getSessionStatus = cache(async (): Promise<SessionStatus> => {
  if (!hasSupabaseEnv()) {
    return {
      isConfigured: false,
      isAuthenticated: false,
      userEmail: null,
    };
  }

  const user = await getCurrentUser();

  return {
    isConfigured: true,
    isAuthenticated: Boolean(user),
    userEmail: user?.email ?? null,
  };
});
