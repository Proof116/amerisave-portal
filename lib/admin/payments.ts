import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminPayment = {
  id: string;
  application_id: string;
  user_id: string;
  purpose: "origination_fee" | "processing_fee";
  amount: number;
  currency: string;
  status:
    | "pending"
    | "processing"
    | "succeeded"
    | "failed"
    | "cancelled";
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  paid_at: string | null;
  created_at: string;
};

export async function getAllPayments(): Promise<AdminPayment[]> {
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
    "admin_get_payments"
  );

  if (error) {
    throw new Error(
      `Unable to load payments: ${error.message}`
    );
  }

  return (data ?? []) as AdminPayment[];
}