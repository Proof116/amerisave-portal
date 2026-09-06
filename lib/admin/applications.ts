import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminApplication = {
  id: string;
  user_id: string;
  loan_type: "home" | "personal";
  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "approved"
    | "declined";
  answers: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  first_name: string | null;
  last_name: string | null;
};

export async function getAdminContext() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role")
    .eq("id", user.id)
    .single();

  if (error || !profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return {
    supabase,
    user,
    profile,
  };
}

export async function getAllApplications(): Promise<AdminApplication[]> {
  const { supabase } = await getAdminContext();

  const { data, error } = await supabase.rpc(
    "admin_get_applications"
  );

  if (error) {
    throw new Error(
      `Unable to load applications: ${error.message}`
    );
  }

  return (data ?? []) as AdminApplication[];
}

export async function getAdminDashboardStats() {
  const { supabase } = await getAdminContext();

  const { data, error } = await supabase.rpc(
    "admin_get_dashboard_stats"
  );

  if (error) {
    throw new Error(
      `Unable to load dashboard stats: ${error.message}`
    );
  }

  const stats = {
  total: Number(data?.total ?? 0),
  draft: Number(data?.draft ?? 0),
  submitted: Number(data?.submitted ?? 0),
  underReview: Number(data?.underReview ?? 0),
  approved: Number(data?.approved ?? 0),
  declined: Number(data?.declined ?? 0),
  homeLoans: Number(data?.homeLoans ?? 0),
  personalLoans: Number(data?.personalLoans ?? 0),
  pipelineValue: Number(data?.pipelineValue ?? 0),
};
  const applications = await getAllApplications();

  return {
    stats,
    recentApplications: applications.slice(0, 5),
  };
}