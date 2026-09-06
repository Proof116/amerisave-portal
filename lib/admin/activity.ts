import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminActivity = {
  id: string;
  application_id: string;
  user_id: string;
  actor_id: string | null;
  event_type: string;
  old_status: string | null;
  new_status: string | null;
  description: string | null;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  actor_first_name: string | null;
  actor_last_name: string | null;
  actor_role: "customer" | "admin" | null;
  loan_type: "home" | "personal" | null;
};

export async function getRecentAdminActivity(
  limit = 20
): Promise<AdminActivity[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data, error } = await supabase.rpc(
    "admin_get_recent_activity",
    {
      activity_limit: limit,
    }
  );

  if (error) {
    throw new Error(
      `Unable to load admin activity: ${error.message}`
    );
  }

  return (data ?? []) as AdminActivity[];
}