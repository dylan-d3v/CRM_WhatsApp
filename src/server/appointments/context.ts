import { getCurrentUser } from "@/lib/auth/user";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AppointmentBusinessContext =
  | {
      ok: true;
      businessId: string;
      supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
      userId: string;
    }
  | {
      ok: false;
      reason: "not_authenticated" | "missing_business";
    };

export async function getAppointmentBusinessContext(): Promise<AppointmentBusinessContext> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      reason: "not_authenticated",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: memberships, error: membershipsError } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (membershipsError || !memberships || memberships.length === 0) {
    return {
      ok: false,
      reason: "missing_business",
    };
  }

  return {
    ok: true,
    businessId: memberships[0].business_id,
    supabase,
    userId: user.id,
  };
}
