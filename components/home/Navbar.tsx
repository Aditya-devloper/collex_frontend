"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowUpRight, LayoutDashboard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const links = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

type User = {
  name?: string;
  email?: string;
  profilePic?: string; // full URL  present for google-provider users
  image?: string; // just a filename  needs MEDIA_URL prefixed
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleAuthRedirect = () => {
    const token = localStorage.getItem("token");
    if (token) window.location.href = "/dashboard";
    else router.push("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    window.location.href = "/";
  };

  // localStorage isn't available on the server, so this only resolves after mount.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "null");
      if (stored) setUser(stored);
    } catch {
      // ignore malformed stored user
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the avatar dropdown on outside click.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarSrc = user?.profilePic || user?.image || "";
  const initial = (user?.name || user?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  const Avatar = ({ size = 34 }: { size?: number }) => (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center bg-[var(--color-coral)]/20 text-[var(--color-coral)] font-display font-semibold border border-white/10 flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={user?.name || "Profile"}
          className="w-full h-full object-cover"
        />
      ) : (
        initial
      )}
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-99 px-4 sm:px-6">
      <nav
        className={`max-w-6xl mx-auto mt-4 rounded-2xl px-5 py-3.5 flex items-center justify-between transition-all duration-300
        ${
          scrolled
            ? "bg-[#0a0d17]/90 backdrop-blur-xl border border-white/10 shadow-lg"
            : "bg-[#0a0d17]/20 backdrop-blur-md border border-white/5"
        }`}
      >
        <a href="#" className="flex items-center">
          <Image
            src="/logo-horizontal-dark.svg"
            alt="Leado"
            width={132}
            height={35}
            priority
          />
        </a>
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="block cursor-pointer"
              >
                <Avatar />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0a0d17]/95 backdrop-blur-xl border border-white/10 shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {user.name || "Account"}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => (window.location.href = "/dashboard")}
                    className="w-full cursor-pointer flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full cursor-pointer flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              onClick={handleAuthRedirect}
              className="text-sm cursor-pointer font-medium bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-full px-4 py-2 flex items-center gap-1.5 hover:bg-white transition-colors"
            >
              Log in
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
        <button
          className="md:hidden p-1.5 text-[var(--color-text-primary)]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden max-w-6xl mx-auto mt-2 rounded-2xl p-5 flex flex-col gap-4 bg-[#0a0d17]/95 backdrop-blur-xl border border-white/10">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm text-[var(--color-text-secondary)]"
            >
              {link.label}
            </a>
          ))}
          <div className="h-[1px] bg-[var(--color-border)]" />
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar size={38} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {user.name || "Account"}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <LayoutDashboard size={14} />
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-red-400"
              >
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <a
              onClick={handleAuthRedirect}
              className="text-sm font-medium bg-[var(--color-text-primary)] text-[var(--color-bg)] rounded-full px-4 py-2.5 text-center"
            >
              Log in
            </a>
          )}
        </div>
      )}
    </header>
  );
}
