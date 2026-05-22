import type { User } from "@supabase/supabase-js";
import { cache } from "react";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export function hasCompletedOnboarding(user: Pick<User, "user_metadata"> | null) {
  const businessName =
    typeof user?.user_metadata?.business_name === "string"
      ? user.user_metadata.business_name.trim()
      : "";

  return businessName.length > 0;
}
