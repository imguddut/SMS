"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings,
  Building2,
  Globe,
  Shield,
  KeyRound,
  CheckCircle2,
  Cpu,
  Layers,
  Save,
  Check,
} from "lucide-react";
import {
  fetchOwnerSchoolSettings,
  SchoolSettingsData,
} from "@/lib/db/owner";

export default function OwnerSettingsPage() {
  const [settings, setSettings] = React.useState<SchoolSettingsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await fetchOwnerSchoolSettings();
        setSettings(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (field: keyof SchoolSettingsData, val: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: val });
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  if (loading || !settings) {
    return (
      <AppShell
        role="OWNER"
        userName="Dr. Arvind Swaminathan"
        userRoleTitle="Chancellor & Chief Trustee"
      >
        <div className="py-20 text-center text-on-surface-variant font-sans">
          Loading settings...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      role="OWNER"
      userName="Dr. Arvind Swaminathan"
      userRoleTitle="Chancellor & Chief Trustee"
      epochText="Academic Year 2024–2025 • Term 2 (CBSE Board) Session"
    >
      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" dot>
                School Details
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                Node ID: SCH-DPS-DEL-01 • Data Safe & Secure
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              School Settings
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Update basic school details, fee currency, academic terms, and security settings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="font-sans gap-2"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-secondary-container" /> Saved Successfully
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-secondary-container" /> Save Configuration
                </>
              )}
            </Button>
          </div>
        </div>

        {/* School Identity Card */}
        <Card className="p-6 space-y-6">
          <div className="pb-4 border-b border-border/60">
            <h3 className="font-serif text-xl font-medium text-primary">
              Institutional Profile &amp; Domain
            </h3>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">
              School name, short name, and region.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-primary">Legal Institutional Name</label>
              <Input
                value={settings.legalName}
                onChange={(e) => handleChange("legalName", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-primary">Subdomain Slug</label>
              <Input
                value={settings.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-primary">Custom Official Domain</label>
              <Input
                value={settings.domain}
                onChange={(e) => handleChange("domain", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-primary">Base Fiscal Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — British Pound (£)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Sovereign Security & Edge Policies */}
        <Card className="p-6 space-y-6">
          <div className="pb-4 border-b border-border/60">
            <h3 className="font-serif text-xl font-medium text-primary">
              School Security Settings
            </h3>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">
              FIPS hardware cryptographic protection and campus turnstile edge synchronization.
            </p>
          </div>

          <div className="space-y-4 font-sans text-sm">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/70 bg-surface">
              <div>
                <div className="font-semibold text-primary">Enforce Multi-Factor Authentication (MFA)</div>
                <div className="text-xs text-on-surface-variant mt-0.5">
                  Mandatory WebAuthn biometric passkey or TOTP for all faculty and administrative accounts.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.mfaEnforced}
                onChange={(e) => handleChange("mfaEnforced", e.target.checked)}
                className="w-4 h-4 text-secondary rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/70 bg-surface">
              <div>
                <div className="font-semibold text-primary">Biometric Turnstile Gateway Edge Sync</div>
                <div className="text-xs text-on-surface-variant mt-0.5">
                  Real-time edge event synchronization with physical security gate turnstiles.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.biometricSync}
                onChange={(e) => handleChange("biometricSync", e.target.checked)}
                className="w-4 h-4 text-secondary rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/70 bg-surface">
              <div>
                <div className="font-semibold text-primary">AI Business &amp; Pedagogical Insights Engine</div>
                <div className="text-xs text-on-surface-variant mt-0.5">
                  Autonomous synthesis of cash flow telemetry, retention risk radar, and timetable optimizations.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.aiInsightsEnabled}
                onChange={(e) => handleChange("aiInsightsEnabled", e.target.checked)}
                className="w-4 h-4 text-secondary rounded"
              />
            </div>
          </div>
        </Card>

        {/* HSM Security Attestation Card */}
        <Card className="p-6 bg-gradient-to-b from-surface to-surface-variant/20 border-border/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary text-secondary-container flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="font-serif text-lg font-medium text-primary">
                  Dedicated HSM Hardware Module
                </div>
                <div className="font-sans text-xs text-[#3D5B42] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> CRYSTALS-Dilithium5 Post-Quantum Attestation
                </div>
              </div>
            </div>

            <Badge variant="gold">FIPS 140-3 Level 4</Badge>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
