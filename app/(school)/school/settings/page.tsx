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
  Clock,
  Bell,
  Shield,
  CheckCircle2,
  Building2,
  Save,
  Check,
} from "lucide-react";
import { fetchSchoolOperationalSettings } from "@/lib/db/school-admin";

export default function SchoolSettingsPage() {
  const [settings, setSettings] = React.useState<any>(null);
  const [isSaved, setIsSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      const data = await fetchSchoolOperationalSettings();
      setSettings(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  if (loading || !settings) {
    return (
      <AppShell
        role="PRINCIPAL"
        userName="Mme. Claire De La Tour"
        userRoleTitle="Head of School & Proviseur"
      >
        <div className="py-20 text-center text-on-surface-variant font-sans">
          Loading campus operational parameters...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      role="PRINCIPAL"
      userName="Mme. Claire De La Tour"
      userRoleTitle="Head of School & Proviseur"
      epochText="Term 3 Cycle (Michaelmas) • Geneva Campus"
    >
      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" dot>
                Proviseur Operations Settings
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                The King's College &amp; Academy • Geneva Wing
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Campus Operations &amp; Academic Settings
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Configure morning roll-call cutoffs, passing grade thresholds, term calendars, and emergency communications broadcast rules.
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
                  <Save className="w-4 h-4 text-secondary-container" /> Save Parameters
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Operational Parameters Card */}
        <Card className="p-6 space-y-6">
          <div className="pb-4 border-b border-border/60">
            <h3 className="font-serif text-xl font-medium text-primary">
              Roll-Call &amp; Academic Scheduling
            </h3>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">
              Daily operational schedules and punctuality thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-primary">
                Morning Roll-Call Cutoff Time
              </label>
              <Input
                value={settings.rollCallCutoffTime}
                onChange={(e) => setSettings({ ...settings, rollCallCutoffTime: e.target.value })}
              />
              <span className="text-[11px] text-on-surface-variant">
                Turnstile swipe events logged after this time are flagged as Late.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-primary">
                Passing Academic Grade Threshold
              </label>
              <Input
                value={settings.passingGradeThreshold}
                onChange={(e) => setSettings({ ...settings, passingGradeThreshold: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-primary">
                Academic Year Title
              </label>
              <Input
                value={settings.academicYearName}
                onChange={(e) => setSettings({ ...settings, academicYearName: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-primary">
                Active Term Cycle
              </label>
              <Input
                value={settings.currentTerm}
                onChange={(e) => setSettings({ ...settings, currentTerm: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Broadcast & Security Toggles */}
        <Card className="p-6 space-y-6">
          <div className="pb-4 border-b border-border/60">
            <h3 className="font-serif text-xl font-medium text-primary">
              Emergency Broadcast &amp; Security Gateways
            </h3>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">
              Rapid parent communication gateways and campus physical access synchronization.
            </p>
          </div>

          <div className="space-y-4 font-sans text-sm">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/70 bg-surface">
              <div>
                <div className="font-semibold text-primary">Emergency SMS &amp; Mobile Broadcast Gateway</div>
                <div className="text-xs text-on-surface-variant mt-0.5">
                  Authorize instant Proviseur broadcast push to all parents and guardians.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.emergencyBroadcastGateway}
                onChange={(e) => setSettings({ ...settings, emergencyBroadcastGateway: e.target.checked })}
                className="w-4 h-4 text-secondary rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/70 bg-surface">
              <div>
                <div className="font-semibold text-primary">Biometric Turnstile Gateway Edge Sync</div>
                <div className="text-xs text-on-surface-variant mt-0.5">
                  Synchronize RFID card credentials and attendance logs with perimeter turnstiles.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.mfaEnforced}
                onChange={(e) => setSettings({ ...settings, mfaEnforced: e.target.checked })}
                className="w-4 h-4 text-secondary rounded"
              />
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
