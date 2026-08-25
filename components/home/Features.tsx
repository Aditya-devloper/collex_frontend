import {
  LayoutDashboard,
  BellRing,
  FileSpreadsheet,
  StickyNote,
  ShieldCheck,
  Activity,
  MessageSquareText,
  PhoneCall,
} from "lucide-react";

const features = [
  {
    icon: MessageSquareText,
    title: "AI chatbot on your website",
    desc: "Answers visitor questions instantly and captures their details as a lead  no manual entry, no missed chats.",
    color: "var(--color-indigo)",
  },
  {
    icon: PhoneCall,
    title: "AI calling agent",
    desc: "Have new leads called automatically the moment they come in, so someone always follows up first.",
    color: "var(--color-coral)",
    badge: "Upcoming",
  },
  {
    icon: LayoutDashboard,
    title: "One dashboard, full picture",
    desc: "Total leads, new leads, today's follow-ups, and conversions  at a glance, every morning.",
    color: "var(--color-indigo)",
  },
  {
    icon: BellRing,
    title: "Follow-ups that find you",
    desc: "Set a date once. Leado surfaces it on your dashboard the day it's due  no more digging through chats.",
    color: "var(--color-coral)",
  },
  {
    icon: FileSpreadsheet,
    title: "Bring your Excel leads in",
    desc: "Already have a spreadsheet of leads? Import it in one go with CSV  export anytime too.",
    color: "var(--color-mint)",
  },
  // {
  //   icon: StickyNote,
  //   title: "Notes that stay with the lead",
  //   desc: "Every call, every requirement, every 'call back next week'  logged right where you need it.",
  //   color: "#a78bfa",
  // },
  {
    icon: Activity,
    title: "Full activity history",
    desc: "See exactly what happened with a lead and when  no more relying on memory.",
    color: "var(--color-coral)",
  },
  // {
  //   icon: ShieldCheck,
  //   title: "Sign in your way",
  //   desc: "Google login or email and password  whichever's faster for you and your team.",
  //   color: "var(--color-indigo)",
  // },
];

export default function Features() {
  return (
    <section id="features" className="relative px-4 sm:px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-medium text-[var(--color-coral)] tracking-wide uppercase mb-3">
            What's inside
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl tracking-tight">
            Everything a spreadsheet can&apos;t do
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="glass rounded-2xl p-6 hover:bg-[var(--color-surface-hover)] transition-colors duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${f.color}1f` }}
                  >
                    <Icon size={18} color={f.color} strokeWidth={2} />
                  </div>
                  {f.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-mint-soft)] text-[var(--color-mint)]">
                      {f.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-medium text-[15px] mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
