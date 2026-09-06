"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Do I need to be technical to set this up?",
    a: "No. If you can use WhatsApp, you can use Collex AI. Sign up, add your first lead, and you're set up in under five minutes.",
  },
  {
    q: "Can I move my existing leads from Excel?",
    a: "Yes  export your spreadsheet as a CSV and import it directly. All your leads come in at once, no manual re-entry.",
  },
  {
    q: "How does the AI chatbot actually work?",
    a: "You add it to your website with one script tag. It answers visitor questions using your own business info, then automatically saves their details as a new lead  no one has to type anything in.",
  },
  {
    q: "Is this only for real estate?",
    a: "No  Collex AI works for any small team that's managing leads manually: coaching centers, clinics, agencies, freelancers, and more.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative px-4 sm:px-6 py-20">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-medium text-[var(--color-coral)] tracking-wide uppercase mb-3">
            Questions
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight">
            Good to know
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q} className="glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-medium text-[15px]">
                    {item.q}
                  </span>
                  <Plus
                    size={18}
                    className="flex-shrink-0 transition-transform duration-300"
                    style={{
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? "200px" : "0px" }}
                >
                  <p className="px-5 pb-5 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
