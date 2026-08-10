"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Check, ShieldCheck, ArrowLeft, Zap } from "lucide-react";
import {
  RZP_TEST_KEY_ID,
  PREMIUM_PLAN_PRICE_INR_MONTHLY,
  PREMIUM_PLAN_PRICE_INR_YEARLY,
  PREMIUM_PLAN_PRICE_USD_MONTHLY,
  PREMIUM_PLAN_PRICE_USD_YEARLY,
} from "@/constants";
import {
  confirmSubscription,
  createSubscriptionOrder,
} from "@/services/services";
import { toast } from "sonner";

const included = [
  "Unlimited leads",
  "Follow-up reminders",
  "CSV import & export",
  "Lead activity history",
  "Notes on every lead",
  "Dashboard & insights",
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

function BillingContent() {
  const router = useRouter();
  const params = useSearchParams();

  const billing = (params.get("billing") as "monthly" | "yearly") ?? "monthly";
  const currency = (params.get("currency") as "INR" | "USD") ?? "INR";

  const [loading, setLoading] = useState(false);
  const [rzpReady, setRzpReady] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Price resolution from env vars
  const priceMap = {
    INR: {
      monthly: PREMIUM_PLAN_PRICE_INR_MONTHLY ?? "599",
      yearly: PREMIUM_PLAN_PRICE_INR_YEARLY ?? "4999",
    },
    USD: {
      monthly: PREMIUM_PLAN_PRICE_USD_MONTHLY ?? "25",
      yearly: PREMIUM_PLAN_PRICE_USD_YEARLY ?? "250",
    },
  };

  const displayPrice = priceMap[currency][billing];
  const symbol = currency === "INR" ? "₹" : "$";
  const isYearly = billing === "yearly";

  // Load Razorpay SDK dynamically — this replaces the <script> tag in index.html
  useEffect(() => {
    if (window.Razorpay) {
      setRzpReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRzpReady(true);
    script.onerror = () => console.error("Razorpay SDK failed to load");
    document.body.appendChild(script);
    return () => {
      // cleanup only if we added it
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!rzpReady) return;
    setLoading(true);

    try {
      const payload = { currency, billing_cycle: billing };
      const res = await createSubscriptionOrder(payload);

      if (res.data.status) {
        const data = res.data.response;

        const options = {
          key: RZP_TEST_KEY_ID,
          amount: data?.amount,
          currency,
          name: "Leado",
          description: `Pro Plan — ${isYearly ? "Yearly" : "Monthly"}`,
          image: "/icon.png",
          order_id: data.id,
          handler: async (response: any) => {
            // Step 3: Verify payment on your backend
            const res = await confirmSubscription({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (res.data.status) {
              toast.success(res.data.message);
              window.location.href = "/dashboard";
            }
          },
          prefill: {
            name: user?.name ?? "",
            email: user.email ?? "",
          },
          theme: {
            color: "#FF6B4A",
            backdrop_color: "#0A0D17",
          },
          modal: {
            ondismiss: () => setLoading(false),
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          console.error("Payment failed", response.error);
          setLoading(false);
        });
        rzp.open();
      }
    } catch (err: any) {
      console.error("Payment initiation error", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Payment Failed. Pease try again",
      );
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="">
        <button
          onClick={() => {
            sessionStorage.setItem("reload-on-back", "1");
            router.back();
          }}
          className="flex cursor-pointer items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="glass-strong rounded-2xl overflow-hidden">
          {/* Plan banner */}
          <div className="bg-[var(--color-coral)]/10 border-b border-white/[0.07] px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-display font-semibold text-[var(--color-text-primary)]">
                Leado Pro
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 capitalize">
                {billing} · {currency}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display font-semibold text-xl text-[var(--color-text-primary)]">
                {symbol}
                {displayPrice}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                /{isYearly ? "year" : "month"}
              </p>
            </div>
          </div>

          {/* User info rows */}
          <div className="divide-y divide-white/[0.06]">
            <Row label="Name" value={user?.name ?? "—"} />
            <Row label="Email" value={user?.email ?? "—"} />
            <Row label="Plan" value="Leado Pro" />
            <Row label="Billing" value={isYearly ? "Yearly" : "Monthly"} />
            <Row label="Amount" value={`${symbol}${displayPrice}`} highlight />
          </div>

          {/* Pay button */}
          <div className="px-6 py-5">
            <button
              onClick={handlePayment}
              disabled={loading || !rzpReady}
              className="w-full cursor-pointer font-medium bg-[var(--color-coral)] text-white rounded-full py-3 text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Opening checkout..." : `Pay ${symbol}${displayPrice}`}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3">
              <ShieldCheck size={12} className="text-[var(--color-mint)]" />
              <p className="text-xs text-[var(--color-text-muted)]">
                Secured by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5">
      <p className="text-sm text-gray-400">{label}</p>
      <p
        className={`text-md font-medium ${highlight ? "text-[var(--color-coral)]" : "text-[var(--color-text-primary)]"}`}
      >
        {value}
      </p>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-bg)]" />}>
      <BillingContent />
    </Suspense>
  );
}
