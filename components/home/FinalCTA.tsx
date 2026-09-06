"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FinalCTA() {
  const router = useRouter();

  const handleAuthRedirect = () => {
    const token = localStorage.getItem("token");

    if (token) {
      window.location.href = "/dashboard";
    } else {
      router.push("/login");
    }
  };

  return (
    <section className="relative px-4 sm:px-6 py-20">
      <div className="max-w-4xl mx-auto glass-strong rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
        <div
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--color-indigo)" }}
        />
        <h2 className="relative font-display font-semibold text-3xl sm:text-4xl tracking-tight max-w-lg mx-auto">
          Stop losing leads to a messy spreadsheet
        </h2>
        <p className="relative mt-4 text-[var(--color-text-secondary)] max-w-md mx-auto">
          Let AI chat with visitors and follow up with leads for you. Free for
          14 days, no card required.
        </p>
        <a
          onClick={handleAuthRedirect}
          className="relative cursor-pointer inline-flex items-center gap-2 mt-8 font-medium bg-[var(--color-coral)] text-white rounded-full px-7 py-3.5 hover:brightness-110 transition-all"
        >
          Start free with Collex AI
          <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}
