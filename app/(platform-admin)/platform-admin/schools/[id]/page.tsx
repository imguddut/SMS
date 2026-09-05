"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Globe,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  GraduationCap,
  CreditCard,
  Settings,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import {
  fetchSchoolById,
  SchoolWithDetails,
  updateSchoolStatus,
  updateSchoolSettings,
} from "@/lib/db/platform-admin";
import { SchoolStatus } from "@/types/database";

export default function PlatformAdminSchoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params?.id as string;

  const [school, setSchool] = React.useState<SchoolWithDetails | null>(null);
  const [activeTab, setActiveTab] = React.useState<
    "telemetry" | "academics" | "personnel" | "ledger" | "security"
  >("telemetry");
  const [loading, setLoading] = React.useState(true);
  const [savingSettings, setSavingSettings] = React.useState(false);

  const loadSchool = React.useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const data = await fetchSchoolById(schoolId);
      setSchool(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  React.useEffect(() => {
    loadSchool();
  }, [loadSchool]);

  const handleStatusChange = async (nextStatus: SchoolStatus) => {
    if (!school) return;
    await updateSchoolStatus(school.id, nextStatus);
    loadSchool();
  };

  const handleToggleSetting = async (key: string, currentValue: boolean) => {
    if (!school) return;
    setSavingSettings(true);
    const updatedSettings = {
      ...((school.settings as any) || {}),
      [key]: !currentValue,
    };
    await updateSchoolSettings(school.id, updatedSettings);
    setSchool({ ...school, settings: updatedSettings });
    setSavingSettings(false);
  };

  if (loading) {
    return (
      <AppShell role="SUPER_ADMIN" userName="Mr. Rajesh Pillai" userRoleTitle="Platform Lead & Super Admin">
        <div className="py-20 text-center text-on-surface-variant font-sans">
          Scanning sovereign partition dossier...
        </div>
      </AppShell>
    );
  }

  if (!school) {
    return (
      <AppShell role="SUPER_ADMIN" userName="Mr. Rajesh Pillai" userRoleTitle="Platform Lead & Super Admin">
        <div className="py-16 text-center space-y-4">
          <h2 className="font-serif text-2xl text-primary">School Node Not Found</h2>
          <p className="text-sm text-on-surface-variant">The requested institutional partition could not be located.</p>
          <Link href="/platform-admin/schools">
            <Button variant="primary">Return to Fleet Directory</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const owner = school.users_profiles?.find((u) => u.role === "OWNER");
  const capacityPct = Math.round(
    ((school.student_count || 850) / school.capacity_target) * 100
  );
  const settings = (school.settings as any) || {};

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName="Mr. Rajesh Pillai"
      userRoleTitle="Platform Lead & Super Admin"
      epochText="Multi-Tenant Sovereign Root • Cluster 01 Online"
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/platform-admin/schools"
            className="font-sans text-xs text-on-surface-variant hover:text-primary flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Fleet Directory
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/platform-admin/impersonate?school=${encodeURIComponent(
                school.legal_name
              )}`}
            >
              <Button variant="outline" size="sm" className="text-xs gap-1.5 text-secondary border-secondary/40">
                <UserCheck className="w-3.5 h-3.5" /> Impersonate Chancellor
              </Button>
            </Link>

            {school.status === "ACTIVE" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("SUSPENDED")}
                className="text-xs text-error hover:bg-error/10 border-error/30"
              >
                Suspend Node
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("ACTIVE")}
                className="text-xs text-[#3D5B42] hover:bg-[#3D5B42]/10 border-[#3D5B42]/30"
              >
                Activate Node
              </Button>
            )}
          </div>
        </div>

        {/* Institutional Header Card */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary text-secondary-container flex items-center justify-center font-serif font-bold text-2xl shadow-sm shrink-0">
                {school.legal_name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl md:text-3xl font-medium text-primary">
                    {school.legal_name}
                  </h1>
                  <Badge
                    variant={
                      school.status === "ACTIVE"
                        ? "active"
                        : school.status === "TRIAL"
                        ? "pending"
                        : "neutral"
                    }
                    dot
                  >
                    {school.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 font-sans text-xs text-on-surface-variant mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-secondary" />
                    {school.domain || `${school.slug}.agragati.edu`}
                  </span>
                  <span>•</span>
                  <span>{school.jurisdiction}</span>
                  <span>•</span>
                  <span className="font-mono">Base: {school.base_currency}</span>
                  <span>•</span>
                  <Badge variant="gold">
                    {settings.plan_tier || "Sovereign Elite"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-6">
              <div>
                <div className="font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Enrolled Scholars
                </div>
                <div className="font-serif text-2xl font-medium text-primary mt-0.5">
                  {school.student_count || 850}
                  <span className="text-xs font-sans text-on-surface-variant font-normal ml-1">
                    / {school.capacity_target}
                  </span>
                </div>
              </div>

              <div>
                <div className="font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Faculty Seats
                </div>
                <div className="font-serif text-2xl font-medium text-primary mt-0.5">
                  {school.faculty_count || 64}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Dossier Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-px overflow-x-auto">
          {[
            { id: "telemetry", label: "Cluster Telemetry", icon: Cpu },
            { id: "academics", label: "Academic Structure", icon: Layers },
            { id: "personnel", label: "Administrative Personnel", icon: Users },
            { id: "ledger", label: "Financial Ledger", icon: CreditCard },
            { id: "security", label: "Sovereign Security Controls", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-sans text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-surface text-primary border-t-2 border-secondary shadow-sm font-semibold"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-variant/30"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-secondary" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Cluster Telemetry */}
        {activeTab === "telemetry" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 p-6 space-y-6">
              <h3 className="font-serif text-lg font-medium text-primary">
                Partition Capacity & Utilization
              </h3>

              <div className="space-y-3 font-sans">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-primary">
                    Capacity Envelope ({capacityPct}% Allocated)
                  </span>
                  <span className="text-on-surface-variant">
                    {school.student_count || 850} of {school.capacity_target} max scholars
                  </span>
                </div>
                <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full"
                    style={{ width: `${Math.min(capacityPct, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-lg bg-surface-variant/30 border border-border/50">
                  <div className="font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Cluster Node
                  </div>
                  <div className="font-mono text-xs font-bold text-primary mt-1">
                    {settings.cluster_node || "MUMBAI-ALPHA-01"}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-variant/30 border border-border/50">
                  <div className="font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Schema Partition
                  </div>
                  <div className="font-mono text-xs font-bold text-primary mt-1">
                    tenant_{school.slug.replace(/-/g, "_")}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-variant/30 border border-border/50">
                  <div className="font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Monthly Latency
                  </div>
                  <div className="font-sans text-xs font-bold text-[#3D5B42] mt-1">
                    12.4ms (99.99%)
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-serif text-base font-medium text-primary">
                Cryptographic Attestation
              </h3>
              <div className="space-y-3 font-sans text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-on-surface-variant">HSM State</span>
                  <span className="text-[#3D5B42] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> DPDP Enclave Active
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-on-surface-variant">Algorithm</span>
                  <span className="font-mono text-secondary">Dilithium-5</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-on-surface-variant">Ledger Isolation</span>
                  <span className="font-semibold text-primary">RLS PostgreSQL</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-on-surface-variant">Daily Backups</span>
                  <span className="text-[#3D5B42] font-semibold">03:30 IST</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Academic Structure */}
        {activeTab === "academics" && (
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h3 className="font-serif text-lg font-medium text-primary">
                  Academic Framework & Class Schedules
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Curriculum: {school.curriculum_framework.replace(/_/g, " ")} (Affiliated CBSE / State)
                </p>
              </div>
              <Badge variant="gold">AY 2024–2025 (Current)</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
              {[
                { term: "Term 1 (Apr–Jul)", dates: "Apr 01, 2024 – Jul 31, 2024", active: false },
                { term: "Term 2 (Aug–Nov)", dates: "Aug 01, 2024 – Nov 30, 2024", active: true },
                { term: "Term 3 (Dec–Mar)", dates: "Dec 01, 2024 – Mar 31, 2025", active: false },
              ].map((t) => (
                <div
                  key={t.term}
                  className={`p-4 rounded-lg border ${
                    t.active ? "bg-primary/5 border-secondary/50" : "bg-surface border-border/70"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-serif font-medium text-primary text-sm">{t.term}</span>
                    {t.active && <Badge variant="active">Current Term</Badge>}
                  </div>
                  <div className="text-xs text-on-surface-variant">{t.dates}</div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                Active Sections &amp; Class Roster ({school.classes?.length || 3})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(school.classes && school.classes.length > 0
                  ? school.classes
                  : [
                      { id: "c1", name: "Class 12-A - Physics & Mathematics", grade_level: 12, curriculum_code: "CBSE_SCI" },
                      { id: "c2", name: "Class 11-B - Computer Science & AI", grade_level: 11, curriculum_code: "CBSE_AI" },
                      { id: "c3", name: "Class 10-A - Foundation Science & Math", grade_level: 10, curriculum_code: "CBSE_SEC" },
                    ]
                ).map((c: any) => (
                  <div key={c.id} className="p-3.5 rounded-lg border border-border/70 bg-surface">
                    <div className="font-serif font-medium text-primary text-sm">{c.name}</div>
                    <div className="font-sans text-xs text-on-surface-variant mt-1 flex justify-between">
                      <span>Class {c.grade_level || 12}</span>
                      <span className="font-mono text-[11px] text-secondary">{c.curriculum_code || "CBSE"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Tab 3: Personnel */}
        {activeTab === "personnel" && (
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h3 className="font-serif text-lg font-medium text-primary">
                  Institutional Leadership & Faculty Directory
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Authorized executive credentials and departmental responsibilities.
                </p>
              </div>
            </div>

            <div className="divide-y divide-border/60 font-sans text-sm">
              {(school.users_profiles && school.users_profiles.length > 0
                ? school.users_profiles
                : [
                    {
                      id: "u1",
                      role: "OWNER",
                      full_name: "Julian Vance-Moreau, D.Phil",
                      email: "owner@kingscollege.edu",
                      title: "Chancellor & Chief Executive",
                      status: "ACTIVE",
                    },
                    {
                      id: "u2",
                      role: "PRINCIPAL",
                      full_name: "Mme. Claire De La Tour",
                      email: "principal@kingscollege.edu",
                      title: "Head of School & Proviseur",
                      status: "ACTIVE",
                    },
                    {
                      id: "u3",
                      role: "ACCOUNTANT",
                      full_name: "Arthur M. Vance",
                      email: "finance@kingscollege.edu",
                      title: "Bursar & Comptroller of the Chest",
                      status: "ACTIVE",
                    },
                  ]
              ).map((user: any) => (
                <div key={user.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-xs">
                      {user.full_name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <div className="font-medium text-primary">{user.full_name}</div>
                      <div className="text-xs text-on-surface-variant">
                        {user.title || user.role} • {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="gold">{user.role}</Badge>
                    <Link
                      href={`/platform-admin/impersonate?search=${encodeURIComponent(
                        user.email
                      )}`}
                    >
                      <Button variant="outline" size="sm" className="text-xs text-secondary">
                        Impersonate
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 4: Financial Ledger */}
        {activeTab === "ledger" && (
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h3 className="font-serif text-lg font-medium text-primary">
                  Financial Ledger &amp; Platform Contract
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Platform subscription status, fee collections in ₹, and automated bank reconciliation.
                </p>
              </div>
              <Badge variant="gold">{settings.plan_tier || "Sovereign Elite"} Tier</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
              <div className="p-4 rounded-lg bg-surface-variant/30 border border-border/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Annual Contract Fee
                </div>
                <div className="font-serif text-2xl font-medium text-secondary mt-1">
                  ₹4,50,000 / yr
                </div>
                <div className="text-xs text-[#3D5B42] font-medium mt-0.5">Paid + GST (Renews Jan 2026)</div>
              </div>

              <div className="p-4 rounded-lg bg-surface-variant/30 border border-border/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Total Student Fees Billed
                </div>
                <div className="font-serif text-2xl font-medium text-primary mt-1">
                  ₹12,45,00,000
                </div>
                <div className="text-xs text-on-surface-variant mt-0.5">Term 1 + Term 2 (CBSE)</div>
              </div>

              <div className="p-4 rounded-lg bg-surface-variant/30 border border-border/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Auto-Reconciliation Rate
                </div>
                <div className="font-serif text-2xl font-medium text-[#3D5B42] mt-1">
                  99.8%
                </div>
                <div className="text-xs text-on-surface-variant mt-0.5">BHIM UPI UTR &amp; SBI / HDFC Bank Feeds</div>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 5: Sovereign Security Controls */}
        {activeTab === "security" && (
          <Card className="p-6 space-y-6">
            <div className="pb-4 border-b border-border/60">
              <h3 className="font-serif text-lg font-medium text-primary">
                Sovereign Security & Cryptographic Policies
              </h3>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Manage hardware enclave settings, biometric sync, and AI neural policies for this institution.
              </p>
            </div>

            <div className="space-y-4 font-sans text-sm">
              {[
                {
                  key: "mfa_enforced",
                  title: "Enforce Multi-Factor Authentication (MFA)",
                  desc: "Require FIPS WebAuthn biometric passkey or TOTP for all institutional personnel.",
                  val: settings.mfa_enforced ?? true,
                },
                {
                  key: "biometric_sync",
                  title: "Biometric Gateway & Turnstile Edge Sync",
                  desc: "Transmit RFID attendance events securely to edge physical security turnstiles.",
                  val: settings.biometric_sync ?? true,
                },
                {
                  key: "ai_insights_enabled",
                  title: "AI Pedagogical Mastery Neural Engine",
                  desc: "Enable automated radar telemetry analysis and predictive academic interventions.",
                  val: settings.ai_insights_enabled ?? true,
                },
                {
                  key: "strict_audit_logging",
                  title: "Zero-Knowledge Sovereign Audit Trail",
                  desc: "Sign every grade change and financial adjustment with Dilithium-5 cryptographic keys.",
                  val: true,
                },
              ].map((toggle) => (
                <div
                  key={toggle.key}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/70 bg-surface"
                >
                  <div className="max-w-xl">
                    <div className="font-semibold text-primary">{toggle.title}</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">{toggle.desc}</div>
                  </div>
                  <button
                    onClick={() => handleToggleSetting(toggle.key, toggle.val)}
                    disabled={savingSettings}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                      toggle.val ? "bg-[#3D5B42]" : "bg-surface-variant"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                        toggle.val ? "translate-x-6" : "translate-x-1"
                      }`}
                    ></span>
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
