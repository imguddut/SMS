"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Server,
  Shield,
  Users,
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Cpu,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import {
  fetchPlatformStats,
  fetchAllSchools,
  SchoolWithDetails,
} from "@/lib/db/platform-admin";

export default function PlatformAdminOverviewPage() {
  const [stats, setStats] = React.useState<any>(null);
  const [schools, setSchools] = React.useState<SchoolWithDetails[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const [sData, schData] = await Promise.all([
          fetchPlatformStats(),
          fetchAllSchools(),
        ]);
        setStats(sData);
        setSchools(schData);
      } catch (e) {
        console.error("Error loading overview data:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppShell
      role="SUPER_ADMIN"
      userName="Mr. Rajesh Pillai"
      userRoleTitle="Platform Lead &amp; Super Admin"
      epochText="Multi-Tenant Sovereign Root • India Central Cluster Online"
    >
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="gold" dot>
                Sovereign Root v4.12 • India
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3D5B42] inline-block animate-pulse"></span>
                Mumbai-Central-01 Cluster: 99.98% Latency Nominal
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Platform Command Overview
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Real-time multi-tenant monitoring, Indian school fleet telemetry, active SaaS contracts, and HSM cryptographic enclave health across MeitY-empanelled clusters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/platform-admin/impersonate">
              <Button variant="outline" size="sm" className="font-sans gap-2">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                Impersonate Session
              </Button>
            </Link>
            <Link href="/platform-admin/schools/new">
              <Button variant="primary" size="sm" className="font-sans gap-2">
                <PlusCircle className="w-4 h-4 text-secondary-container" />
                Provision School Node
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-border/80 shadow-sm hover:border-secondary/40 transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Active School Nodes
              </span>
              <div className="w-8 h-8 rounded-lg bg-surface-variant/80 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-secondary" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-primary">
                {loading ? "..." : stats?.activeSchools ?? 3}
                <span className="text-xs font-sans text-on-surface-variant font-normal ml-2">
                  / {stats?.totalSchools ?? 3} total
                </span>
              </div>
              <div className="font-sans text-xs text-secondary font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +1 provisioned this quarter
              </div>
            </div>
          </Card>

          <Card className="p-5 border-border/80 shadow-sm hover:border-secondary/40 transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Total Enrolled Students
              </span>
              <div className="w-8 h-8 rounded-lg bg-surface-variant/80 flex items-center justify-center">
                <Users className="w-4 h-4 text-secondary" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-primary">
                {loading ? "..." : stats?.totalStudents?.toLocaleString() ?? "1,650"}
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-secondary" />
                Across Delhi, Karnataka &amp; Maharashtra
              </div>
            </div>
          </Card>

          <Card className="p-5 border-border/80 shadow-sm hover:border-secondary/40 transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Platform ARR (Run-Rate)
              </span>
              <span className="text-secondary font-bold text-xs bg-secondary-container/40 px-2 py-0.5 rounded">
                INR (₹)
              </span>
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-secondary">
                ₹4.82 Cr
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-1">
                99.4% contract renewal fidelity
              </div>
            </div>
          </Card>

          <Card className="p-5 border-border/80 shadow-sm hover:border-secondary/40 transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                HSM Enclave State
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#3D5B42]/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#3D5B42]" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-[#3D5B42] flex items-center gap-2">
                Nominal
                <span className="w-2.5 h-2.5 rounded-full bg-[#3D5B42] inline-block animate-ping"></span>
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-1">
                Dilithium-5 post-quantum verified
              </div>
            </div>
          </Card>
        </div>

        {/* ARR & Multi-Cluster Node Telemetry Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ARR Performance breakdown */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h3 className="font-serif text-lg font-medium text-primary">
                  SaaS Revenue Trajectory
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Institutional contract run-rates (FY 2024–2025)
                </p>
              </div>
              <Link href="/platform-admin/billing">
                <Button variant="ghost" size="sm" className="text-xs text-secondary gap-1">
                  View Full Ledger <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-surface-variant/40 border border-border/50">
                <div>
                  <div className="font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Metro Hubs (NCR &amp; BLR)
                  </div>
                  <div className="font-serif text-xl font-medium text-primary mt-1">
                    ₹3.65 Cr
                  </div>
                  <div className="font-sans text-[11px] text-secondary font-medium mt-0.5">
                    75.7% of total ARR
                  </div>
                </div>
                <div>
                  <div className="font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Regional Branches
                  </div>
                  <div className="font-serif text-xl font-medium text-primary mt-1">
                    ₹98 Lakhs
                  </div>
                  <div className="font-sans text-[11px] text-secondary font-medium mt-0.5">
                    20.3% of total ARR
                  </div>
                </div>
                <div>
                  <div className="font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    HSM Enclave Addons
                  </div>
                  <div className="font-serif text-xl font-medium text-primary mt-1">
                    ₹19 Lakhs
                  </div>
                  <div className="font-sans text-[11px] text-[#3D5B42] font-medium mt-0.5">
                    100% margin
                  </div>
                </div>
              </div>

              {/* Progress bars for tier distribution */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-sans">
                  <span className="font-medium text-primary">
                    Sovereign Fleet Tier (66.7%)
                  </span>
                  <span className="text-on-surface-variant">₹4,50,000/yr / school</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-variant overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "67%" }}></div>
                </div>

                <div className="flex justify-between text-xs font-sans pt-2">
                  <span className="font-medium text-primary">
                    Enterprise Campus Tier (33.3%)
                  </span>
                  <span className="text-on-surface-variant">₹2,50,000/yr / school</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-variant overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "33%" }}></div>
                </div>
              </div>
            </div>
          </Card>

          {/* HSM & Cryptographic Enclave Card */}
          <Card className="p-6 bg-gradient-to-b from-surface to-surface-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary text-secondary-container flex items-center justify-center shadow-sm">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-medium text-primary">
                  HSM Root Enclave
                </h3>
                <span className="font-sans text-[11px] text-[#3D5B42] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> FIPS 140-3 Level 4 Active
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3 font-sans text-xs">
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-on-surface-variant">Master Root Key ID</span>
                <span className="font-mono text-[11px] font-bold text-primary">
                  HSM-ZUR-9942-X
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-on-surface-variant">Signature Algorithm</span>
                <span className="font-mono text-[11px] text-secondary font-semibold">
                  CRYSTALS-Dilithium5
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-on-surface-variant">ZK-Rollup Proofs</span>
                <span className="font-medium text-primary">48,290 / 24h</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-on-surface-variant">Key Rotation Cycle</span>
                <span className="font-medium text-on-surface-variant">In 82 days</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60">
              <Link href="/platform-admin/settings">
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-secondary" />
                  Configure Cryptography
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Live School Nodes Fleet Table */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-medium text-primary">
                  Sovereign School Fleet
                </h3>
                <Badge variant="navy">{schools.length} Connected Nodes</Badge>
              </div>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Active tenant isolation partitions, curriculum architectures, and chancellor assignments.
              </p>
            </div>
            <Link href="/platform-admin/schools">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                View Full Directory <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-surface-variant/40 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-border/60">
                <tr>
                  <th className="py-3.5 px-6">Institutional Node</th>
                  <th className="py-3.5 px-6">Curriculum & Domain</th>
                  <th className="py-3.5 px-6">Jurisdiction</th>
                  <th className="py-3.5 px-6">Capacity</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {schools.map((school) => {
                  const capacityPct = Math.round(
                    ((school.student_count || 850) / school.capacity_target) * 100
                  );
                  return (
                    <tr
                      key={school.id}
                      className="hover:bg-surface-variant/20 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary text-secondary-container flex items-center justify-center font-serif font-bold text-sm shadow-sm">
                            {school.legal_name.charAt(0)}
                          </div>
                          <div>
                            <Link
                              href={`/platform-admin/schools/${school.id}`}
                              className="font-medium text-primary hover:text-secondary transition-colors"
                            >
                              {school.legal_name}
                            </Link>
                            <div className="text-xs text-on-surface-variant font-mono">
                              slug: {school.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-medium text-primary text-xs">
                          {school.curriculum_framework.replace(/_/g, " ")}
                        </div>
                        <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <Globe className="w-3 h-3 text-secondary" />
                          {school.domain || `${school.slug}.agragati.edu`}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-xs">
                        <span className="font-medium text-primary">
                          {school.jurisdiction}
                        </span>
                        <div className="text-on-surface-variant font-mono text-[11px]">
                          Base: {school.base_currency}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="w-32">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-primary">
                              {school.student_count || 850}
                            </span>
                            <span className="text-on-surface-variant">
                              / {school.capacity_target}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                capacityPct > 85 ? "bg-[#3D5B42]" : "bg-secondary"
                              }`}
                              style={{ width: `${Math.min(capacityPct, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
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
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <Link href={`/platform-admin/schools/${school.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Dossier
                          </Button>
                        </Link>
                        <Link
                          href={`/platform-admin/impersonate?school=${encodeURIComponent(
                            school.legal_name
                          )}`}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-secondary hover:text-secondary-fixed hover:border-secondary"
                          >
                            Impersonate
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
