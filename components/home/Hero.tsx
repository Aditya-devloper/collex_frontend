"use client";

import { ArrowRight } from "lucide-react";
import PipelineVisual from "./PipelineVisual";
import { useRouter } from "next/navigation";

export default function Hero() {
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
    <section className="relative pt-36 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-[var(--color-text-secondary)] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-mint)]" />
          AI chatbot + calling agent for every lead you get
        </div>

        <h1 className="font-display font-semibold text-[2.5rem] sm:text-6xl lg:text-[4.2rem] leading-[1.05] tracking-tight text-gradient">
          Let AI handle
          <br />every follow-up.{" "}
          <span className="text-[var(--color-coral)]">
            Not a forgotten tab.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed">
          Collex AI chats with your website visitors, captures every lead
          automatically, and reminds you the moment a follow-up is due  so
          nothing slips through a spreadsheet again.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            onClick={handleAuthRedirect}
            className="w-full sm:w-auto cursor-pointer font-medium bg-[var(--color-coral)] text-white rounded-full px-6 py-3.5 flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          >
            Start free — no card needed
            <ArrowRight size={16} />
          </a>
          <a
            href="#features"
            className="w-full sm:w-auto font-medium glass rounded-full px-6 py-3.5 flex items-center justify-center hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-primary)]"
          >
            See how it works
          </a>
        </div>

        <p className="mt-4 text-xs text-[var(--color-text-muted)]">
          14-day free trial · AI chatbot included · Setup takes 5 minutes
        </p>
      </div>

      <div className="mt-16 sm:mt-20">
        <PipelineVisual />
      </div>
    </section>
  );
}
