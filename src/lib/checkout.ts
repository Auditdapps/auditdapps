// src/lib/checkout.ts
import { supabase } from "@/lib/supabaseClient";

export async function startCheckout(priceId: string) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("[startCheckout] getUser error:", authError);
    throw new Error("Could not get current user.");
  }

  if (!user || !user.email) {
    throw new Error("You must be logged in to subscribe.");
  }

  const { data, error } = await supabase.functions.invoke(
    "create-checkout-session",
    {
      body: {
        priceId,
        userId: user.id,
        email: user.email,
        successUrl: `${window.location.origin}/auth/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/auth/payment`,
      },
    }
  );

  if (error) {
    console.error("[startCheckout] invoke error:", error);
    throw new Error("Could not start checkout.");
  }

  if (!data?.url) {
    console.error("[startCheckout] No URL returned:", data);
    throw new Error(
      data?.error || "No checkout URL returned from server."
    );
  }

  window.location.href = data.url;
}
