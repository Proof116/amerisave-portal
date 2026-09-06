import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminCustomer = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: "customer";
  created_at: string;
  application_count: number;
};

export async function getAllCustomers(
  searchTerm?: string
): Promise<AdminCustomer[]> {
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
    "admin_search_customers",
    {
      search_term: searchTerm?.trim() || null,
    }
  );

  if (error) {
    throw new Error(
      `Unable to load customers: ${error.message}`
    );
  }

  return (data ?? []) as AdminCustomer[];
}