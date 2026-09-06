import Image from "next/image";

export default function Footer() {
  const message = encodeURIComponent(
    "Hi Aditya, I want to know more about Collex AI.",
  );

  return (
    <footer className="relative px-4 sm:px-6 py-5 border-t border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Image
          src="/logo-horizontal-dark.svg"
          alt="Collex AI"
          width={110}
          height={29}
        />

        <div className="flex items-center gap-5 text-xs text-[var(--color-text-secondary)]">
          <a
            href="#"
            className="hover:text-[var(--color-text-primary)] transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="hover:text-[var(--color-text-primary)] transition-colors"
          >
            Terms
          </a>
          <a
            href={`https://wa.me/919584712453?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-text-primary)] transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
      <p className="text-xs text-center mt-5 text-[var(--color-text-muted)]">
        © {new Date().getFullYear()} Collex AI. AI agents that chat, call, and
        follow up  so no lead is forgotten.
      </p>
    </footer>
  );
}
