"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Users,
  Building2,
  TrendingUp,
  BrainCircuit,
  ArrowUpRight,
  Sparkles,
  IndianRupee,
  Calendar,
  AlertCircle,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { fetchOwnerOverviewStats, OwnerOverviewStats } from "@/lib/db/owner";
import { formatIndianCurrency } from "@/lib/utils";

export default function OwnerOverview() {
  const [stats, setStats] = React.useState<OwnerOverviewStats | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>("annual");
  const [selectedCampus, setSelectedCampus] = React.useState<string>("all");
  const [activeModalMetric, setActiveModalMetric] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const data = await fetchOwnerOverviewStats();
      setStats(data);
    } catch (e) {
      console.error("Error loading owner overview stats:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadData();
    }, 400);
  };

  // Metric multipliers based on selected campus & period
  const campusFactor = selectedCampus === "all" ? 1.0 : selectedCampus === "delhi" ? 0.4 : 0.6;
  const periodFactor = selectedPeriod === "term1" ? 0.35 : selectedPeriod === "term2" ? 0.35 : selectedPeriod === "term3" ? 0.30 : 1.0;

  const displayStudents = Math.round((stats?.totalEnrolled || 3420) * (selectedCampus === "all" ? 1.0 : campusFactor * 1.6));
  const displayFaculty = Math.round((stats?.facultyCount || 248) * (selectedCampus === "all" ? 1.0 : campusFactor * 1.6));
  const displayPendingFees = Math.round((stats?.outstandingBalance || 2486000) * campusFactor);
  const displayWeekly = Math.round((stats?.weeklyCollected || 1842000) * campusFactor);

  return (
    <AppShell
      role="OWNER"
      schoolName="The King's College & Academy"
      campusName={selectedCampus === "delhi" ? "DELHI CAMPUS" : selectedCampus === "geneva" ? "GENEVA CAMPUS" : "ALL CAMPUSES"}
      epochText="Academic Year 2024–2025 • Executive Console"
      userName="Dr. Arvind Swaminathan"
      userRoleTitle="Chancellor & Chief Trustee"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Banner linking to full KPI summary */}
        <div className="p-3.5 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <BarChart3 className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Looking for multi-campus KPIs, fee yield breakdown, and print-ready reports?</span>
          </div>
          <Link href="/organization/kpis">
            <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1 shrink-0">
              Summary &amp; Numbers Dashboard <ArrowUpRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                Executive Campus Overview
              </span>
              <span className="text-xs text-slate-500">Live Telemetry</span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
              School Overview
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-1">
              Check total student enrollment, fee collection status, staff counts, and school profit in plain English.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-xs h-9 gap-1.5 border-slate-300 dark:border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Link href="/owner/insights">
              <Button variant="outline" size="sm" className="gap-2 h-9 text-xs border-slate-300 dark:border-slate-700 font-semibold">
                <BrainCircuit className="w-4 h-4 text-blue-500" />
                AI Advice
              </Button>
            </Link>
            <Link href="/owner/fee-analytics">
              <Button size="sm" className="gap-2 h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                <IndianRupee className="w-4 h-4" />
                Fee Details
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Controls: Campus & Period Selector */}
        <div className="p-3 rounded-xl bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Campus:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {[
                { id: "all", label: "All Campuses" },
                { id: "geneva", label: "Geneva Campus" },
                { id: "delhi", label: "Delhi Campus" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCampus(c.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    selectedCampus === c.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Term:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {[
                { id: "annual", label: "Full Year" },
                { id: "term1", label: "Term 1" },
                { id: "term2", label: "Term 2" },
                { id: "term3", label: "Term 3" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPeriod(p.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    selectedPeriod === p.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid (Interactive KPI cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            onClick={() => setActiveModalMetric("students")}
            className="p-4 border-l-4 border-l-blue-600 bg-white dark:bg-[#0B1528] border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[125px] cursor-pointer hover:border-blue-500/80 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Students</span>
              </div>
              <Badge variant="neutral" className="text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold">
                {stats?.enrolledYoY || "Up 5.4%"}
              </Badge>
            </div>
            <div>
              <div className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
                {displayStudents.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center justify-between">
                <span><strong className="text-blue-600 dark:text-blue-400">{stats?.retentionRate || "98.2%"}</strong> retention rate</span>
                <span className="text-blue-500 group-hover:underline flex items-center">Inspect →</span>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => setActiveModalMetric("fees")}
            className="p-4 border-l-4 border-l-emerald-600 bg-white dark:bg-[#0B1528] border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[125px] cursor-pointer hover:border-emerald-500/80 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <IndianRupee className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Fees Collected</span>
              </div>
              <Badge variant="neutral" className="text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold">
                Target 95%
              </Badge>
            </div>
            <div>
              <div className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
                {stats?.feeCollectionRate || "94.6%"}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center justify-between">
                <span>+{formatIndianCurrency(displayWeekly)} this week</span>
                <span className="text-emerald-500 group-hover:underline flex items-center">Inspect →</span>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => setActiveModalMetric("arrears")}
            className="p-4 border-l-4 border-l-amber-500 bg-white dark:bg-[#0B1528] border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[125px] cursor-pointer hover:border-amber-500/80 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Pending Fees</span>
              </div>
              <Badge variant="neutral" className="text-[9px] px-1.5 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold">
                {stats?.overdueLedgersCount || 72} Accounts
              </Badge>
            </div>
            <div>
              <div className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
                {formatIndianCurrency(displayPendingFees)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center justify-between">
                <span>4.1% uncollected dues</span>
                <span className="text-amber-500 group-hover:underline flex items-center">Inspect →</span>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => setActiveModalMetric("faculty")}
            className="p-4 border-l-4 border-l-purple-600 bg-white dark:bg-[#0B1528] border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[125px] cursor-pointer hover:border-purple-500/80 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Staff & Teachers</span>
              </div>
              <Badge variant="neutral" className="text-[9px] px-1.5 py-0 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-semibold">
                {stats?.facultyRatio || "1:14"}
              </Badge>
            </div>
            <div>
              <div className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
                {displayFaculty}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center justify-between">
                <span>1 teacher per 14 students</span>
                <span className="text-purple-500 group-hover:underline flex items-center">Inspect →</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Collection Timeline & AI Strategic Advice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fee Collection Progress */}
          <Card className="md:col-span-2 p-6 space-y-6 bg-white dark:bg-[#0B1528] border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                  Fee Collection Progress
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Term installments realized to date (in ₹ Indian Rupees)
                </p>
              </div>
              <Link href="/owner/fee-analytics">
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs border-slate-300 dark:border-slate-700">
                  <PieChart className="w-3.5 h-3.5 text-blue-500" />
                  Detailed Report
                </Button>
              </Link>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Term 1 (Apr–Jul) • Completed
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">₹4.42 Cr / ₹4.50 Cr (98.2%)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: "98.2%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1.5">
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Term 2 (Aug–Nov) • Current Epoch
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">₹3.98 Cr / ₹4.15 Cr (95.9%)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: "95.9%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1.5">
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Term 3 (Dec–Mar) • Upcoming
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">₹3.38 Cr / ₹3.80 Cr (88.9%)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "88.9%" }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total Billed
                </div>
                <div className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  ₹12.45 Cr
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Collected to Date
                </div>
                <div className="font-serif text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ₹11.78 Cr
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Online Success Rate
                </div>
                <div className="font-serif text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  99.8%
                </div>
              </div>
            </div>
          </Card>

          {/* AI Planning & Advice */}
          <Card className="p-6 bg-white dark:bg-[#0B1528] border-slate-200 dark:border-slate-800 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 dark:text-slate-100">
                    AI Planning & Advice
                  </h3>
                  <span className="font-sans text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                    Smart Suggestions for School
                  </span>
                </div>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-blue-500/20 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span>Send Reminders Early</span>
                    <Badge variant="gold" className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/30">High Impact</Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    Sending fee reminders 14 days before due date will help collect <strong>₹21,00,000</strong> faster.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span>Hostel is Getting Full</span>
                    <Badge variant="neutral" className="text-[9px]">94.7% Full</Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    Tagore House only has 8 beds left for next year.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link href="/owner/insights">
                <Button size="sm" className="w-full text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  See Smart Suggestions
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Operational Quick Nav Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/owner/staff" className="group">
            <Card className="p-5 hover:border-blue-500/60 transition-all cursor-pointer h-full flex flex-col justify-between bg-white dark:bg-[#0B1528] border-slate-200 dark:border-slate-800 shadow-xs">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                  Staff Details
                </h4>
                <p className="font-sans text-xs text-slate-600 dark:text-slate-400 mt-1">
                  148 senior teachers across 4 departments. See their salary and duties.
                </p>
              </div>
              <div className="font-sans text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-4">
                View Teachers List <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>

          <Link href="/owner/growth" className="group">
            <Card className="p-5 hover:border-blue-500/60 transition-all cursor-pointer h-full flex flex-col justify-between bg-white dark:bg-[#0B1528] border-slate-200 dark:border-slate-800 shadow-xs">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                  Admissions Progress
                </h4>
                <p className="font-sans text-xs text-slate-600 dark:text-slate-400 mt-1">
                  480 parents have inquired for admission. Track new student applications.
                </p>
              </div>
              <div className="font-sans text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-4">
                View Admissions List <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>

          <Link href="/owner/settings" className="group">
            <Card className="p-5 hover:border-blue-500/60 transition-all cursor-pointer h-full flex flex-col justify-between bg-white dark:bg-[#0B1528] border-slate-200 dark:border-slate-800 shadow-xs">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-3">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                  School Settings
                </h4>
                <p className="font-sans text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Manage academic year, fee types, and basic school information.
                </p>
              </div>
              <div className="font-sans text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-4">
                Change Settings <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Drill-down modal for KPI inspection */}
      {activeModalMetric && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                  {activeModalMetric === "students" && "Student Numbers Breakdown"}
                  {activeModalMetric === "fees" && "Fee Realization Details"}
                  {activeModalMetric === "arrears" && "Pending Fee Accounts"}
                  {activeModalMetric === "faculty" && "Faculty Staffing Status"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Quick campus data overview</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalMetric(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              {activeModalMetric === "students" && (
                <div className="space-y-2">
                  <div className="p-3 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                    <span className="font-bold text-blue-900 dark:text-blue-200">
                      Total Enrolled: {displayStudents.toLocaleString()} Scholars
                    </span>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      98.2% annual retention. 180 seats remain open for new admissions this year.
                    </p>
                  </div>
                </div>
              )}

              {activeModalMetric === "fees" && (
                <div className="space-y-2">
                  <div className="p-3 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">
                      Collection Realization: {stats?.feeCollectionRate || "94.6%"}
                    </span>
                    <p className="text-emerald-700 dark:text-emerald-300 mt-1">
                      Online collections via BHIM UPI and Net Banking represent 90.4% of all payments.
                    </p>
                  </div>
                </div>
              )}

              {activeModalMetric === "arrears" && (
                <div className="space-y-2">
                  <div className="p-3 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                    <span className="font-bold text-amber-900 dark:text-amber-200">
                      Pending Fees: {formatIndianCurrency(displayPendingFees)}
                    </span>
                    <p className="text-amber-700 dark:text-amber-300 mt-1">
                      72 accounts have pending payments. Batch reminder notices can be issued with one click.
                    </p>
                  </div>
                </div>
              )}

              {activeModalMetric === "faculty" && (
                <div className="space-y-2">
                  <div className="p-3 rounded bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
                    <span className="font-bold text-purple-900 dark:text-purple-200">
                      Faculty Headcount: {displayFaculty} Certified Teachers
                    </span>
                    <p className="text-purple-700 dark:text-purple-300 mt-1">
                      Student-to-Teacher ratio is 1:14 across senior and middle classes.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModalMetric(null)}
                className="text-xs"
              >
                Close
              </Button>
              <Link href="/organization/kpis">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5">
                  View Full KPI Summary <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
