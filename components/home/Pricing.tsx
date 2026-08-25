"use client";

import { Check, ArrowRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getPlans } from "@/services/services";

type Plan = {
  _id: string;
  name: string;
  display_name: string;
  price: number;
  currency: string;
  billing_cycle: "monthly" | "yearly";
  included_calls: number;
  included_chat_messages: number;
  agent_limit: number;
  lead_limit: number;
  storage_limit?: number;
  is_active: boolean;
};

const POPULAR_PLANS = ["Starter"];
const FREE_TRIAL_DAYS = 14;

const UNLIMITED_THRESHOLD = 100000;

function formatLimit(n: number, label: string) {
  if (n >= UNLIMITED_THRESHOLD) return `Unlimited ${label}`;
  return `${n.toLocaleString()} ${label}`;
}

function featuresFor(plan: Plan): string[] {
  const items: string[] = [];
  items.push(formatLimit(plan.lead_limit, "leads"));
  items.push(
    `${plan.agent_limit} team ${plan.agent_limit === 1 ? "agent" : "agents"}`,
  );
  if (plan.included_chat_messages > 0) {
    items.push(formatLimit(plan.included_chat_messages, "chat messages / mo"));
  }
  if (plan.included_calls > 0) {
    items.push(formatLimit(plan.included_calls, "AI calls / mo"));
  }
  if (plan.storage_limit) {
    items.push(`${plan.storage_limit} MB storage`);
  }
  return items;
}

export default function Pricing() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const isYearly = billing === "yearly";
  const isUSD = currency === "USD";
  const symbol = isUSD ? "$" : "₹";

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await getPlans({});
        if (res.data?.status) {
          setAllPlans(
            (res.data.response || []).filter((p: Plan) => p.is_active),
          );
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const visiblePlans = useMemo(() => {
    const groups = new Map<string, Plan[]>();
    for (const p of allPlans) {
      const arr = groups.get(p.display_name) || [];
      arr.push(p);
      groups.set(p.display_name, arr);
    }

    const result: Plan[] = [];
    for (const [, variants] of groups) {
      const match =
        variants.find(
          (v) => v.currency === currency && v.billing_cycle === billing,
        ) ||
        variants.find((v) => v.price === 0) ||
        variants[0];
      if (match) result.push(match);
    }
    return result.sort((a, b) => a.price - b.price);
  }, [allPlans, currency, billing]);

  const monthlyEquivalentSavings = (plan: Plan) => {
    if (!isYearly || plan.price === 0) return null;
    const monthlyVariant = allPlans.find(
      (v) =>
        v.display_name === plan.display_name &&
        v.currency === currency &&
        v.billing_cycle === "monthly",
    );
    if (!monthlyVariant) return null;
    const diff = monthlyVariant.price * 12 - plan.price;
    return diff > 0 ? `Save ${symbol}${diff}/yr` : null;
  };

  const handleFreeTrial = () => {
    const token = localStorage.getItem("token");
    if (token) window.location.href = "/dashboard";
    else router.push("/login");
  };

  const handleBuyPlan = (plan: Plan) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    router.push(`/billing?plan=${plan.name}`);
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
            Try everything free for {FREE_TRIAL_DAYS} days. No card needed.
          </p>
        </div>

        {/* Controls: billing toggle + currency switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
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
              className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-200 ${
                billing === "yearly"
                  ? "bg-white/10 text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              Yearly
            </button>
          </div>

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

        {/* Plan cards  driven entirely by what's in the DB */}
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-5">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="glass rounded-3xl p-8 h-72 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            className={`grid gap-5 items-start ${
              visiblePlans.length === 1
                ? "max-w-sm mx-auto"
                : visiblePlans.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {visiblePlans.map((plan) => {
              const isFree = plan.price === 0;
              const isPopular = POPULAR_PLANS.includes(plan.display_name);
              const savings = monthlyEquivalentSavings(plan);
              const features = featuresFor(plan);

              return (
                <div
                  key={plan._id}
                  className={`rounded-3xl p-7 sm:p-8 flex flex-col h-full relative overflow-hidden ${
                    isPopular ? "glass-strong" : "glass"
                  }`}
                >
                  {isPopular && (
                    <div
                      className="absolute -top-16 -right-16 w-52 h-52 rounded-full opacity-25 blur-3xl pointer-events-none"
                      style={{ background: "var(--color-coral)" }}
                    />
                  )}

                  <div className="relative flex items-center justify-between mb-6">
                    <div>
                      <p className="font-display font-semibold text-lg text-[var(--color-text-primary)] flex items-center gap-2">
                        {plan.display_name}
                        {isPopular && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-coral-soft)] text-[var(--color-coral)]">
                            POPULAR
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        {isFree
                          ? "Full access, zero commitment"
                          : "Everything you need, forever"}
                      </p>
                    </div>
                    {isPopular && (
                      <Zap
                        size={18}
                        className="text-[var(--color-coral)] flex-shrink-0"
                      />
                    )}
                  </div>

                  <div className="relative mb-6">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display font-semibold text-4xl text-[var(--color-text-primary)]">
                        {symbol}
                        {plan.price}
                      </span>
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        {isFree
                          ? `/ ${FREE_TRIAL_DAYS} days`
                          : `/${isYearly ? "year" : "month"}`}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-2">
                      {isFree ? (
                        "No credit card required"
                      ) : isYearly ? (
                        <>
                          Billed annually · No setup fee
                          {savings && (
                            <span className="text-[var(--color-mint)] font-medium">
                              {savings}
                            </span>
                          )}
                        </>
                      ) : (
                        "Billed monthly · No setup fee"
                      )}
                    </p>
                  </div>

                  <div className="relative flex flex-col gap-2.5 mb-8 flex-1">
                    {features.map((item) => (
                      <div key={item} className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isPopular
                              ? "bg-[var(--color-mint-soft)]"
                              : "bg-white/[0.06] border border-white/10"
                          }`}
                        >
                          <Check
                            size={11}
                            color={
                              isPopular
                                ? "var(--color-mint)"
                                : "var(--color-text-secondary)"
                            }
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
                    onClick={() =>
                      isFree ? handleFreeTrial() : handleBuyPlan(plan)
                    }
                    className={`relative cursor-pointer w-full font-medium rounded-full px-6 py-3.5 flex items-center justify-center gap-2 transition-all ${
                      isPopular
                        ? "bg-[var(--color-coral)] text-white hover:brightness-110 shadow-[0_8px_24px_-8px_rgba(255,107,74,0.5)]"
                        : "border border-white/15 text-[var(--color-text-primary)] hover:bg-white/[0.06]"
                    }`}
                  >
                    {isFree ? "Start free trial" : `Get ${plan.display_name}`}
                    <ArrowRight size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
