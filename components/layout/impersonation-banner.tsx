"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImpersonationBanner() {
  const router = useRouter();
  const [impersonatingUser, setImpersonatingUser] = React.useState<{
    name: string;
    role: string;
    school: string;
  } | null>(null);

  React.useEffect(() => {
    // Check if impersonation cookie/state exists
    const checkCookies = () => {
      const cookies = document.cookie.split(";").reduce((acc, c) => {
        const [k, v] = c.trim().split("=");
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
      }, {} as Record<string, string>);

      if (cookies["agragati_impersonating"]) {
        try {
          const parsed = JSON.parse(cookies["agragati_impersonating"]);
          setImpersonatingUser(parsed);
        } catch {
          setImpersonatingUser({
            name: "Impersonated User",
            role: cookies["agragati_role"] || "OWNER",
            school: "Target Institution",
          });
        }
      }
    };

    checkCookies();
  }, []);

  const handleExit = () => {
    // Clear impersonation cookies and restore SUPER_ADMIN
    document.cookie = "agragati_impersonating=; path=/; max-age=0";
    document.cookie = "agragati_role=SUPER_ADMIN; path=/; max-age=86400";
    router.push("/platform-admin/impersonate");
    router.refresh();
  };

  if (!impersonatingUser) return null;

  return (
    <div className="bg-gradient-to-r from-[#141F38] via-[#2A1D0F] to-[#141F38] text-on-primary border-b border-[#C9A24B]/40 px-4 py-2 text-xs font-sans flex items-center justify-between shadow-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-[#C9A24B] text-[#141F38] flex items-center justify-center font-bold">
          <ShieldAlert className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-[#FDD275] uppercase tracking-wider">
            Viewing Portal As:
          </span>
          <span className="text-white font-medium flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-[#C9A24B]" />
            {impersonatingUser.name}
          </span>
          <span className="text-white/60">•</span>
          <span className="text-white/80 font-mono text-[11px] bg-white/10 px-1.5 py-0.5 rounded">
            {impersonatingUser.role}
          </span>
          <span className="text-white/60">•</span>
          <span className="text-white/80">{impersonatingUser.school}</span>
        </div>
      </div>
      <Button
        variant="gold"
        size="sm"
        onClick={handleExit}
        className="h-7 text-xs px-3 font-semibold gap-1.5 shrink-0 bg-[#C9A24B] text-[#141F38] hover:bg-[#b08b3a]"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Admin
      </Button>
    </div>
  );
}
