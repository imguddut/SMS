"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  TrendingUp,
  Users,
  Wallet,
  Building2,
  GraduationCap,
  BrainCircuit,
  ArrowUpRight,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Sparkles,
} from "lucide-react";
import {
  fetchOwnerOverviewStats,
  OwnerOverviewStats,
} from "@/lib/db/owner";
import { formatIndianCurrency, formatIndianLakhsCrores } from "@/lib/utils";

export default function OwnerOverviewPage() {
  const [stats, setStats] = React.useState<OwnerOverviewStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await fetchOwnerOverviewStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppShell
      role="OWNER"
      userName="Dr. Arvind Swaminathan"
      userRoleTitle="Chancellor & Chief Trustee"
      epochText="Academic Year 2024–2025 • Term 2 (CBSE Board) Financial Epoch"
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="gold" dot>
                Executive Command Console
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                Delhi Public School, R.K. Puram • National Sovereign Enclave
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Institutional Business Overview
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Consolidated fiscal health, BHIM UPI fee realization velocity, faculty operational efficiency, and academic year run-rate.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/owner/insights">
              <Button variant="outline" size="sm" className="font-sans gap-2 text-secondary border-secondary/40">
                <BrainCircuit className="w-4 h-4 text-secondary" />
                AI Strategic Insights
              </Button>
            </Link>
            <Link href="/owner/fee-analytics">
              <Button variant="primary" size="sm" className="font-sans gap-2">
                <Wallet className="w-4 h-4 text-secondary-container" />
                Fee Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <Card className="p-5 flex flex-col justify-between h-44 border-border/80 shadow-sm hover:border-secondary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Total Enrolled
              </span>
              <Badge variant="active">+4.2% YoY</Badge>
            </div>
            <div>
              <div className="font-serif text-3xl font-medium text-primary">
                {stats ? stats.totalEnrolled.toLocaleString() : "1,842"}
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-1">
                98.2% retention cohort
              </div>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[98.2%]" />
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between h-44 border-border/80 shadow-sm hover:border-secondary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Fee Collection Rate
              </span>
              <Badge variant="gold">Tgt 95.0%</Badge>
            </div>
            <div>
              <div className="font-serif text-3xl font-medium text-secondary">
                {stats ? stats.feeCollectionRate : "94.6%"}
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-1">
                +₹18.4 Lakhs this week
              </div>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div className="bg-secondary h-full w-[94.6%]" />
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between h-44 border-border/80 shadow-sm hover:border-secondary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Outstanding Receivables
              </span>
              <Wallet className="w-4 h-4 text-on-surface-variant" />
            </div>
            <div>
              <div className="font-serif text-3xl font-medium text-primary">
                {stats ? formatIndianCurrency(stats.outstandingBalance) : "₹67,00,000"}
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-1">
                72 ledgers (4.1% cohort)
              </div>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div className="bg-[#C9A24B] h-full w-[24%]" />
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between h-44 border-border/80 shadow-sm hover:border-secondary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Faculty &amp; Staff
              </span>
              <span className="font-sans text-xs font-semibold text-[#3D5B42]">Stable</span>
            </div>
            <div>
              <div className="font-serif text-3xl font-medium text-primary">
                {stats ? stats.facultyCount : "148"}
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-1">
                1:12.4 Faculty Ratio (PGT/TGT)
              </div>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[88%]" />
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between h-44 border-border/80 shadow-sm hover:border-secondary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Operating Margin
              </span>
              <Badge variant="active">Run-Rate</Badge>
            </div>
            <div>
              <div className="font-serif text-3xl font-medium text-[#3D5B42]">
                {stats ? stats.operatingMargin : "32.4%"}
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-1">
                +₹1.42 Cr projected surplus
              </div>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div className="bg-[#3D5B42] h-full w-[65%]" />
            </div>
          </Card>
        </div>

        {/* Main Telemetry Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fiscal Fee Realization Trajectory */}
          <Card className="lg:col-span-2 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h3 className="font-serif text-xl font-medium text-primary">
                  Academic Fee Realization Trajectory
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  FY 2024–2025 Term Invoicing vs Automated UPI &amp; Bank Settlement (INR ₹)
                </p>
              </div>
              <Link href="/owner/fee-analytics">
                <Button variant="ghost" size="sm" className="text-xs text-secondary gap-1">
                  Deep Analysis <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {/* Term Bar Visualizer */}
            <div className="space-y-4 font-sans text-xs">
              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-primary font-semibold">Term 1 (Apr–Jul) • Settled</span>
                  <span className="text-[#3D5B42] font-bold">₹4.42 Cr / ₹4.50 Cr (98.2%)</span>
                </div>
                <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden">
                  <div className="bg-[#3D5B42] h-full rounded-full" style={{ width: "98.2%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-primary font-semibold">Term 2 (Aug–Nov) • Active Processing</span>
                  <span className="text-secondary font-bold">₹3.98 Cr / ₹4.15 Cr (95.9%)</span>
                </div>
                <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: "95.9%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-primary font-semibold">Term 3 (Dec–Mar) • Invoicing Staged</span>
                  <span className="text-on-surface-variant font-bold">₹3.38 Cr / ₹3.80 Cr (88.9%)</span>
                </div>
                <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden">
                  <div className="bg-primary/50 h-full rounded-full" style={{ width: "88.9%" }}></div>
                </div>
              </div>
            </div>

            {/* Summary Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-lg bg-surface-variant/40 border border-border/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Total Billed
                </div>
                <div className="font-serif text-lg font-medium text-primary mt-0.5">
                  ₹12.45 Cr
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-variant/40 border border-border/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Collected to Date
                </div>
                <div className="font-serif text-lg font-medium text-secondary mt-0.5">
                  ₹11.78 Cr
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-variant/40 border border-border/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  UPI / Bank Auto-Match
                </div>
                <div className="font-serif text-lg font-medium text-[#3D5B42] mt-0.5">
                  99.8%
                </div>
              </div>
            </div>
          </Card>

          {/* AI Strategic Advisory & Risk Radar */}
          <Card className="p-6 bg-gradient-to-b from-surface to-secondary-container/10 border-secondary/40 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary text-secondary-container flex items-center justify-center shadow-sm">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-primary">
                  Executive AI Advisory
                </h3>
                <span className="font-sans text-[11px] text-secondary font-medium">
                  Autonomous Governance Engine
                </span>
              </div>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3.5 rounded-lg bg-surface border border-secondary/30 space-y-1">
                <div className="flex items-center justify-between font-bold text-primary">
                  <span>Term 3 Pre-Collection Staging</span>
                  <Badge variant="gold">High Impact</Badge>
                </div>
                <p className="text-on-surface-variant leading-relaxed text-[11px]">
                  Issuing BHIM UPI &amp; Direct Bank Challan mandates 14 days prior to term will accelerate <strong>₹21,00,000</strong> in liquidity.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-surface border border-border/70 space-y-1">
                <div className="flex items-center justify-between font-bold text-primary">
                  <span>Hostel Capacity Alert</span>
                  <Badge variant="pending">94.7% Full</Badge>
                </div>
                <p className="text-on-surface-variant leading-relaxed text-[11px]">
                  Tagore House Senior Wing has only 8 admissions remaining for Academic Year 2025–26.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <Link href="/owner/insights">
                <Button variant="primary" size="sm" className="w-full text-xs gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-secondary-container" />
                  Review 4 Strategic Actions
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Operational Quick Nav Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/owner/staff" className="group">
            <Card className="p-5 hover:border-secondary/60 transition-all cursor-pointer h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary-container transition-colors mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-medium text-primary">
                  Staff &amp; Faculty Governance
                </h4>
                <p className="font-sans text-xs text-on-surface-variant mt-1">
                  148 senior PGT/TGT faculty across 4 departments. Review departmental salary allocations.
                </p>
              </div>
              <div className="font-sans text-xs font-semibold text-secondary flex items-center gap-1 mt-4">
                Inspect Faculty Roster <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>

          <Link href="/owner/growth" className="group">
            <Card className="p-5 hover:border-secondary/60 transition-all cursor-pointer h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary-container transition-colors mb-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-medium text-primary">
                  Growth &amp; Admissions Funnel
                </h4>
                <p className="font-sans text-xs text-on-surface-variant mt-1">
                  480 inquiries in active pipeline. Track international boarding applications and offers.
                </p>
              </div>
              <div className="font-sans text-xs font-semibold text-secondary flex items-center gap-1 mt-4">
                View Admissions Pipeline <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>

          <Link href="/owner/settings" className="group">
            <Card className="p-5 hover:border-secondary/60 transition-all cursor-pointer h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary-container transition-colors mb-3">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-medium text-primary">
                  Institutional Settings &amp; Enclave
                </h4>
                <p className="font-sans text-xs text-on-surface-variant mt-1">
                  Manage academic year schedules, multi-currency ledger settings, and biometric edge turnstiles.
                </p>
              </div>
              <div className="font-sans text-xs font-semibold text-secondary flex items-center gap-1 mt-4">
                Configure School Node <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
