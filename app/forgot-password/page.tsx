"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-academic-canvas flex flex-col justify-between">
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-outline-variant/40 bg-surface/60 backdrop-blur-md">
        <Link href="/login" className="flex items-center gap-2 text-xs font-medium text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Institutional Gateway</span>
        </Link>
        <span className="font-serif text-lg font-medium text-primary">Agragati</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px] space-y-6">
          <Card variant="elevated" className="p-6 md:p-8 space-y-6">
            {!submitted ? (
              <>
                <div className="space-y-2">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-secondary font-bold">
                    Security Credentials Recovery
                  </span>
                  <h1 className="font-serif text-2xl font-medium tracking-tight text-primary">
                    Reset Sovereign Passkey
                  </h1>
                  <p className="font-sans text-xs text-on-surface-variant">
                    Enter your registered institutional email to receive an audited cryptographic recovery link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Institutional Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@institution.agragati.edu"
                    leftIcon={<Mail className="w-4 h-4" />}
                  />

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    Dispatch Recovery Directive
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-[#3D5B42]/10 text-[#3D5B42] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-xl font-medium text-primary">
                  Recovery Token Dispatched
                </h2>
                <p className="font-sans text-xs text-on-surface-variant">
                  A sealed cryptographic reset link has been transmitted to <strong className="text-on-surface">{email}</strong>. The link expires in 15 minutes.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="outline" size="md" className="w-full">
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
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
