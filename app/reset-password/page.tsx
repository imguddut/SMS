"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passkeys do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Passkey must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setError("");

    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-academic-canvas flex flex-col justify-between">
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-outline-variant/40 bg-surface/60 backdrop-blur-md">
        <Link href="/login" className="flex items-center gap-2 text-xs font-medium text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Gateway</span>
        </Link>
        <span className="font-serif text-lg font-medium text-primary">Agragati</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px] space-y-6">
          <Card variant="elevated" className="p-6 md:p-8 space-y-6">
            {!success ? (
              <>
                <div className="space-y-2">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-secondary font-bold">
                    Credential Re-issuance
                  </span>
                  <h1 className="font-serif text-2xl font-medium tracking-tight text-primary">
                    Set New Master Passkey
                  </h1>
                  <p className="font-sans text-xs text-on-surface-variant">
                    Establish a compliant sovereign credential for your institutional session.
                  </p>
                </div>

                <form onSubmit={handleReset} className="space-y-4">
                  <Input
                    label="New Master Passkey"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    leftIcon={<Lock className="w-4 h-4" />}
                  />

                  <Input
                    label="Confirm New Master Passkey"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    leftIcon={<Lock className="w-4 h-4" />}
                  />

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
                    Seal New Master Passkey
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-[#3D5B42]/10 text-[#3D5B42] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-xl font-medium text-primary">
                  Passkey Successfully Updated
                </h2>
                <p className="font-sans text-xs text-on-surface-variant">
                  Redirecting to sovereign sign-in stage...
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-xs text-on-surface-variant border-t border-outline-variant/30">
        &copy; {new Date().getFullYear()} Agragati Sovereign Academic Technologies.
      </footer>
    </div>
  );
}
