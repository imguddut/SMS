"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  GraduationCap,
  Wallet,
  TrendingUp,
  PlusCircle,
  ExternalLink,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-context";
import { getOrganizationMetrics, OrganizationSummary } from "@/lib/services/organization-service";
import { formatIndianCurrency } from "@/lib/utils";

export default function OrganizationDashboardPage() {
  const { currentOrganization, currentSchool, switchSchool, allSchoolsMode, setAllSchoolsMode } = useAuth();
  const [metrics, setMetrics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const orgId = currentOrganization?.id || "e0000000-0000-0000-0000-000000000001";

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getOrganizationMetrics(orgId);
        setMetrics(data);
      } catch (err) {
        console.error("Error loading org metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orgId]);

  return (
    <AppShell
      role="ORGANIZATION_OWNER"
      userName="Julian Vance-Moreau, D.Phil"
      userRoleTitle="Chancellor & Trust Chairman"
      epochText="Multi-School Sovereign Fleet • Autonomous Federation"
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Header with Organization Title & Quick Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold tracking-wide border border-emerald-300 dark:border-emerald-800">
                {currentOrganization?.organization_type || "TRUST"} • PRIMARY TENANT
              </span>
              <Badge variant="neutral" className="text-xs bg-stone-50 dark:bg-stone-900">
                Plan: {currentOrganization?.subscription_plan || "ENTERPRISE_FLEET"}
              </Badge>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              {currentOrganization?.name || "King's Educational Trust"}
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              Consolidated governance, multi-school operational metrics, and treasury oversight.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={allSchoolsMode ? "primary" : "outline"}
              size="sm"
              onClick={() => setAllSchoolsMode(!allSchoolsMode)}
              className="text-xs h-9 gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              {allSchoolsMode ? "All Schools (Active)" : "View All Schools"}
            </Button>
            <Link href="/organization/add-school">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 gap-1.5 shadow-sm">
                <PlusCircle className="w-4 h-4" />
                Add School
              </Button>
            </Link>
          </div>
        </div>

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xs shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Affiliated Schools
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {metrics?.totalSchools || 2}
                  </span>
                  <span className="text-xs text-emerald-600 font-medium flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> 100% Active
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <Building2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xs shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Total Scholars
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {metrics?.totalStudents?.toLocaleString() || "3,420"}
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">+8.4% YoY</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-700 dark:text-blue-400">
                <GraduationCap className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xs shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Total Faculty
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {metrics?.totalTeachers || 248}
                  </span>
                  <span className="text-xs text-stone-500">1:14 Ratio</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
                <Users className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xs shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Treasury Collection
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {formatIndianCurrency(metrics?.totalCollected || 45200000)}
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">93.2% Rate</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Multi-School Fleet Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                Managed Schools ({metrics?.schoolsSummary?.length || 2})
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Independent operational environments under {currentOrganization?.name || "this Organization"}.
              </p>
            </div>
            <Link href="/organization/add-school">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <PlusCircle className="w-3.5 h-3.5" /> New School
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(metrics?.schoolsSummary || []).map((school: any) => {
              const isSelected = currentSchool?.id === school.id;
              return (
                <Card
                  key={school.id}
                  className={`border transition-all duration-200 ${
                    isSelected
                      ? "border-amber-500/80 bg-amber-50/20 dark:bg-amber-950/20 shadow-md ring-1 ring-amber-500/30"
                      : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700"
                  }`}
                >
                  <CardHeader className="pb-3 flex flex-row items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono text-[10px] font-bold">
                          {school.code}
                        </span>
                        <Badge variant="neutral" className="text-[10px] text-emerald-700 border-emerald-300">
                          {school.status}
                        </Badge>
                      </div>
                      <CardTitle className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 mt-1">
                        {school.name}
                      </CardTitle>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {school.city} • Autonomous Campus
                      </p>
                    </div>

                    <Button
                      variant={isSelected ? "primary" : "outline"}
                      size="sm"
                      onClick={() => switchSchool(school.id)}
                      className="text-xs h-8"
                    >
                      {isSelected ? "Active Campus" : "Select Campus"}
                    </Button>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-2 py-3 my-2 border-y border-stone-100 dark:border-stone-800/80 text-center">
                      <div>
                        <span className="text-xs text-stone-400 block">Scholars</span>
                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                          {school.students}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-stone-400 block">Faculty</span>
                        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                          {school.teachers}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-stone-400 block">Collection</span>
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {school.feeCollectionRate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-stone-500">
                        Attendance: <strong className="text-stone-700 dark:text-stone-300">{school.attendanceRate}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <Link href="/school/overview">
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-amber-700 dark:text-amber-400">
                            Launch Portal <ArrowUpRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Feature Flags & SaaS Subscription Summary */}
        <Card className="border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-lg font-bold">
                  Organization Subscription & Feature Modules
                </CardTitle>
                <p className="text-xs text-stone-500">
                  Configured subscription plan limits and enabled operational features for {currentOrganization?.name}.
                </p>
              </div>
              <Badge className="bg-emerald-600 text-white">Active Subscription</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { name: "Treasury & Fees", enabled: true },
                { name: "Live Attendance", enabled: true },
                { name: "Homework Suite", enabled: true },
                { name: "Exam Gradebook", enabled: true },
                { name: "Biometric Integration", enabled: true },
                { name: "UPI Online Payment", enabled: true },
              ].map((feat) => (
                <div
                  key={feat.name}
                  className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 flex items-center justify-between"
                >
                  <span className="text-xs font-medium text-stone-800 dark:text-stone-200">{feat.name}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
