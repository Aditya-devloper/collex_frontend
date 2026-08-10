"use client";

import { Check, ArrowRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PREMIUM_PLAN_PRICE_INR_MONTHLY,
  PREMIUM_PLAN_PRICE_INR_YEARLY,
  PREMIUM_PLAN_PRICE_USD_MONTHLY,
  PREMIUM_PLAN_PRICE_USD_YEARLY,
} from "@/constants";

const included = [
  "Unlimited leads",
  "Follow-up reminders",
  "CSV import & export",
  "Lead activity history",
  "Notes on every lead",
  "Dashboard & insights",
];

export default function Pricing() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");

  const isYearly = billing === "yearly";
  const isUSD = currency === "USD";

  // Pull from env vars, with sensible fallbacks
  const inrMonthly = PREMIUM_PLAN_PRICE_INR_MONTHLY ?? "1999";
  const inrYearly = PREMIUM_PLAN_PRICE_INR_YEARLY ?? "19999";
  const usdMonthly = PREMIUM_PLAN_PRICE_USD_MONTHLY ?? "25";
  const usdYearly = PREMIUM_PLAN_PRICE_USD_YEARLY ?? "250";

  const displayPrice = isUSD
    ? isYearly
      ? usdYearly
      : usdMonthly
    : isYearly
      ? inrYearly
      : inrMonthly;

  const symbol = isUSD ? "$" : "₹";

  // Yearly savings label
  const savingsLabel = isUSD
    ? `Save $${Number(usdMonthly) * 12 - Number(usdYearly)}/yr`
    : `Save ₹${Number(inrMonthly) * 12 - Number(inrYearly)}/yr`;

  const handleFreeTrial = () => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/dashboard";
    } else {
      router.push("/login");
    }
  };

  const handleBuyPremium = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    // Pass billing + currency context to billing page via query params
    router.push(`/billing?plan=pro&billing=${billing}&currency=${currency}`);
  };

  return (
    <section id="pricing" className="relative px-4 sm:px-6 py-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-medium text-[var(--color-coral)] tracking-wide uppercase mb-3">
            Pricing
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight">
            Simple pricing. No surprise tiers.
          </h2>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            Try everything free for 14 days. No card needed.
          </p>
        </div>

        {/* Controls: billing toggle + currency switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          {/* Monthly / Yearly toggle */}
          <div className="glass rounded-full p-1 flex items-center gap-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-200 ${
                billing === "monthly"
                  ? "bg-white/10 text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                billing === "yearly"
                  ? "bg-white/10 text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              Yearly
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--color-mint-soft)] text-[var(--color-mint)]">
                {isUSD ? "Save $50" : "Save ₹2,189"}
              </span>
            </button>
          </div>

          {/* INR / USD switcher */}
          <div className="glass rounded-full p-1 flex items-center gap-1">
            {(["INR", "USD"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-200 ${
                  currency === c
                    ? "bg-white/10 text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                }`}
              >
                {c === "INR" ? "🇮🇳 INR" : "🇺🇸 USD"}
              </button>
            ))}
          </div>
        </div>

        {/* Two cards */}
        <div className="grid sm:grid-cols-2 gap-5 items-start">
          {/* ── Free trial card ── */}
          <div className="glass rounded-3xl p-7 sm:p-8 flex flex-col h-full">
            <div className="mb-6">
              <p className="font-display font-semibold text-lg text-[var(--color-text-primary)]">
                Free Trial
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Full access, zero commitment
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-semibold text-4xl">
                  {symbol}0
                </span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  / 14 days
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                No credit card required
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mb-8 flex-1">
              {included.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Check
                      size={11}
                      color="var(--color-text-secondary)"
                      strokeWidth={3}
                    />
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleFreeTrial}
              className="w-full cursor-pointer font-medium border border-white/15 text-[var(--color-text-primary)] rounded-full px-6 py-3 flex items-center justify-center gap-2 hover:bg-white/[0.06] transition-all"
            >
              Start free trial
              <ArrowRight size={15} />
            </button>
          </div>

          {/* ── Pro card ── */}
          <div className="glass-strong rounded-3xl p-7 sm:p-8 flex flex-col h-full relative overflow-hidden">
            {/* Glow */}
            <div
              className="absolute -top-16 -right-16 w-52 h-52 rounded-full opacity-25 blur-3xl pointer-events-none"
              style={{ background: "var(--color-coral)" }}
            />

            {/* Popular badge */}
            <div className="relative flex items-center justify-between mb-6">
              <div>
                <p className="font-display font-semibold text-lg text-[var(--color-text-primary)] flex items-center gap-2">
                  Leado Pro
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-coral-soft)] text-[var(--color-coral)]">
                    POPULAR
                  </span>
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  Everything you need, forever
                </p>
              </div>
              <Zap
                size={18}
                className="text-[var(--color-coral)] flex-shrink-0"
              />
            </div>

            {/* Price */}
            <div className="relative mb-6">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-semibold text-4xl text-[var(--color-text-primary)]">
                  {symbol}
                  {displayPrice}
                </span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  /{isYearly ? "year" : "month"}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-2">
                {isYearly ? (
                  <>
                    Billed annually · No setup fee
                    <span className="text-[var(--color-mint)] font-medium">
                      {savingsLabel}
                    </span>
                  </>
                ) : (
                  "Billed monthly · No setup fee"
                )}
              </p>
            </div>

            {/* Features */}
            <div className="relative flex flex-col gap-2.5 mb-8 flex-1">
              {included.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-mint-soft)] flex items-center justify-center flex-shrink-0">
                    <Check
                      size={11}
                      color="var(--color-mint)"
                      strokeWidth={3}
                    />
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handleBuyPremium}
              className="relative cursor-pointer w-full font-medium bg-[var(--color-coral)] text-white rounded-full px-6 py-3.5 flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-[0_8px_24px_-8px_rgba(255,107,74,0.5)]"
            >
              Get Leado Pro
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
