"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/auth";
import { getRoleHomeRoute } from "@/lib/supabase/middleware";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<UserRole>("OWNER");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authErr || !data?.user) {
        throw new Error(authErr?.message || "Invalid login credentials. Please check your email and password.");
      }

      const userRole = (data.user.user_metadata?.role as UserRole) || selectedRole;

      if (data.session?.access_token) {
        document.cookie = `agragati_session=${data.session.access_token}; path=/; max-age=86400; SameSite=Lax`;
      }
      document.cookie = `agragati_role=${userRole}; path=/; max-age=86400; SameSite=Lax`;

      const targetRoute = getRoleHomeRoute(userRole);
      router.push(targetRoute);
      router.refresh();
    } catch (err: unknown) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Authentication error");
    }
  };

  const roles: { role: UserRole; label: string; portal: string }[] = [
    { role: "SUPER_ADMIN", label: "System Admin", portal: "Admin Portal" },
    { role: "OWNER", label: "School Owner / Trustee", portal: "Management Office" },
    { role: "PRINCIPAL", label: "Principal", portal: "School Office" },
    { role: "SCHOOL_ADMIN", label: "School Admin", portal: "Operations" },
    { role: "TEACHER", label: "Teacher", portal: "Teacher Area" },
    { role: "ACCOUNTANT", label: "Accounts Officer", portal: "Fees & Accounts" },
    { role: "PARENT", label: "Parent / Guardian", portal: "Parent Portal" },
    { role: "STUDENT", label: "Student", portal: "Student Desk" },
  ];

  return (
    <div className="min-h-screen bg-academic-canvas flex flex-col justify-between selection:bg-secondary/20 selection:text-primary">
      {/* Top Minimal Utility Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-10 border-b border-outline-variant/40 bg-surface/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <svg
              className="w-4 h-4 text-secondary-container"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
              <line x1="12" y1="9" x2="12" y2="21" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg tracking-tight font-medium text-primary">
              Agragati
            </span>
            <span className="text-[10px] font-sans uppercase tracking-[0.14em] text-on-surface-variant font-bold">
              School System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <Badge variant="active" dot>
            CBSE Aligned &amp; Secure
          </Badge>
          <span className="hidden sm:inline text-outline-variant">•</span>
          <span className="hidden sm:inline">Delhi Public School, R.K. Puram</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 z-10">
        <div className="w-full max-w-[480px] space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-sans uppercase tracking-widest text-secondary font-bold">
              Welcome to Agragati
            </span>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-primary">
              Sign In to Your Account
            </h1>
            <p className="font-sans text-xs text-on-surface-variant max-w-sm mx-auto">
              Choose your role below or enter your email and password to log in.
            </p>
          </div>

          <Card variant="elevated" className="p-6 md:p-8 space-y-6">
            {/* Quick Role Selector */}
            <div className="space-y-2">
              <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface flex justify-between">
                <span>Select Your Role</span>
                <span className="text-secondary font-bold">8 Portals</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1 no-scrollbar">
                {roles.map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r.role);
                    }}
                    className={`p-2 rounded-md text-left text-xs transition-all border ${
                      selectedRole === r.role
                        ? "bg-primary-container text-on-primary border-secondary font-semibold shadow-sm"
                        : "bg-surface-container-low text-on-surface hover:bg-surface-container border-outline-variant/40"
                    }`}
                  >
                    <div className="font-medium truncate">{r.label}</div>
                    <div className="text-[10px] opacity-70 truncate">{r.portal}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-on-surface-variant">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-primary focus:ring-0 accent-primary cursor-pointer"
                  />
                  <span>Remember me on this computer</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-secondary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-error-container text-error text-xs font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </Card>

          <div className="text-center text-[11px] text-on-surface-variant flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span>Safe &amp; Secure 256-Bit Encrypted Login</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-on-surface-variant border-t border-outline-variant/30">
        &copy; {new Date().getFullYear()} Agragati School Management System. All rights reserved.
      </footer>
    </div>
  );
}
