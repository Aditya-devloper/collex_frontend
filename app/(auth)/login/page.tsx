"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/auth/card";
import { Input } from "@/components/auth/input";
import { Button } from "@/components/auth/button";
import { Label } from "@/components/auth/label";
import { createAccount, googleLogin } from "@/services/services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Image from "next/image";

type LoginMethod = "email" | "google";

// One key, read on mount to show a hint + highlight; written right before
// each redirect on success. Kept as a tiny helper so both handlers agree
// on the storage key instead of duplicating the string everywhere.
const LAST_METHOD_KEY = "lastLoginMethod";
const rememberMethod = (method: LoginMethod) =>
  localStorage.setItem(LAST_METHOD_KEY, method);

export default function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastMethod, setLastMethod] = useState<LoginMethod | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem(LAST_METHOD_KEY);
    if (stored === "email" || stored === "google") setLastMethod(stored);
  }, []);

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length != 6)
      return toast.error("Password must be at least 6 characters");

    try {
      setLoading(true);
      const res = await createAccount({ name, email, password });
      if (res.data.status) {
        toast.success(res.data.message);
        localStorage.setItem("token", res.data.response?.token);
        rememberMethod("email");

        if (res.data.response.hasBusiness) {
          localStorage.setItem("user", JSON.stringify(res.data.response?.user));
          window.location.href = "/dashboard";
        } else {
          router.replace("/setup-business");
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.response?.[0]?.msg ||
          err.response?.data?.message ||
          err?.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    const token = credentialResponse.credential;
    try {
      setLoading(true);
      const res = await googleLogin({ token });
      if (res.data.status) {
        toast.success(res.data.message);
        localStorage.setItem("token", res.data.response?.token);
        rememberMethod("google");

        if (res.data.response.hasBusiness) {
          localStorage.setItem("user", JSON.stringify(res.data.response?.user));
          window.location.href = "/dashboard";
        } else {
          router.replace("/setup-business");
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md relative overflow-hidden">
      {/* Decorative glow, purely cosmetic */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "var(--color-coral)" }}
      />

      <CardHeader className="text-center space-y-2 pb-2 relative">
        <div className="flex items-center justify-center">
          <Image
            src="/logo-horizontal-dark.svg"
            alt="Leado"
            width={122}
            height={25}
            priority
          />
        </div>
        <h2 className="text-lg font-display font-semibold text-[var(--color-text-primary)]">
          Sign in to your account
        </h2>
        {lastMethod && (
          <p className="text-xs text-[var(--color-text-muted)]">
            You last signed in with{" "}
            {lastMethod === "google" ? "Google" : "email & password"}
          </p>
        )}
      </CardHeader>

      <CardContent className="relative">
        <form
          onSubmit={handleEmailLogin}
          className={`space-y-4 rounded-xl transition-all ${
            lastMethod === "email"
              ? "ring-1 ring-[var(--color-coral)]/40 p-3 -m-3"
              : ""
          }`}
        >
          <div>
            <Label>Email</Label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
              />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label>Password</Label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
              />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            size="default"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
            {!loading && <ArrowRight size={15} />}
          </Button>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-grow h-px bg-white/10" />
          <span className="px-3 text-[var(--color-text-muted)] text-xs uppercase tracking-wide">
            Or
          </span>
          <div className="flex-grow h-px bg-white/10" />
        </div>

        <div
          className={`flex justify-center [&>div]:w-full rounded-xl transition-all ${
            lastMethod === "google"
              ? "ring-1 ring-[var(--color-coral)]/40 p-2 -m-2"
              : ""
          }`}
        >
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              await handleGoogleLogin(credentialResponse);
            }}
            onError={() => {
              console.log("Login Failed");
            }}
            theme={"outline"}
            size="large"
            shape="pill"
          />
        </div>
      </CardContent>
    </Card>
  );
}
