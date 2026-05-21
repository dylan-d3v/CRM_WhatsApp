import { cache } from "react";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

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

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    isConfigured: true,
    isAuthenticated: Boolean(user),
    userEmail: user?.email ?? null,
  };
});
