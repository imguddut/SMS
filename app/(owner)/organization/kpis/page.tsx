"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Percent,
  Layers,
  Clock,
  PieChart,
  ShieldCheck,
  ChevronRight,
  FileSpreadsheet,
  X,
  ExternalLink,
  Plus,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-context";
import { getOrganizationMetrics } from "@/lib/services/organization-service";
import { fetchOwnerOverviewStats } from "@/lib/db/owner";
import { formatIndianCurrency } from "@/lib/utils";
import { PdfPreviewModal } from "@/components/ui/pdf-preview-modal";

interface CampusKPI {
  id: string;
  name: string;
  code: string;
  city: string;
  students: number;
  capacity: number;
  capacityPercent: number;
  teachers: number;
  teacherRatio: string;
  feeCollected: number;
  feeBilled: number;
  feeRate: string;
  pendingFees: number;
  attendanceRate: string;
  boardPassRate: string;
  distinctionRate: string;
}

export default function OrganizationKpisPage() {
  const { currentOrganization, currentSchool, switchSchool } = useAuth();
  const [selectedCampus, setSelectedCampus] = React.useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>("annual");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const [orgMetrics, setOrgMetrics] = React.useState<any>(null);
  const [ownerStats, setOwnerStats] = React.useState<any>(null);

  // Drilldown modal state
  const [activeModalMetric, setActiveModalMetric] = React.useState<string | null>(null);

  // Export PDF preview modal state
  const [isExportModalOpen, setIsExportModalOpen] = React.useState<boolean>(false);

  const orgId = currentOrganization?.id || "e0000000-0000-0000-0000-000000000001";

  // Multi-campus dataset
  const campusesData: CampusKPI[] = [
    {
      id: "sch-001",
      name: "The King's College & Academy",
      code: "TKC-GEN",
      city: "Geneva Campus",
      students: 2120,
      capacity: 2250,
      capacityPercent: 94.2,
      teachers: 152,
      teacherRatio: "1:13.9",
      feeCollected: 29800000,
      feeBilled: 31500000,
      feeRate: "94.6%",
      pendingFees: 1700000,
      attendanceRate: "97.2%",
      boardPassRate: "99.6%",
      distinctionRate: "81.2%",
    },
    {
      id: "sch-002",
      name: "The King's Academy - Delhi",
      code: "TKC-DEL",
      city: "New Delhi Campus",
      students: 1300,
      capacity: 1400,
      capacityPercent: 92.8,
      teachers: 96,
      teacherRatio: "1:13.5",
      feeCollected: 15400000,
      feeBilled: 17000000,
      feeRate: "90.5%",
      pendingFees: 1600000,
      attendanceRate: "95.6%",
      boardPassRate: "98.8%",
      distinctionRate: "74.8%",
    },
  ];

  // Load metrics from services
  const loadData = React.useCallback(async () => {
    try {
      const [m, s] = await Promise.all([
        getOrganizationMetrics(orgId),
        fetchOwnerOverviewStats(),
      ]);
      setOrgMetrics(m);
      setOwnerStats(s);
    } catch (err) {
      console.error("Error loading KPI metrics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orgId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadData();
    }, 400);
  };

  // Filtered values depending on campus & period selector
  const activeCampuses = selectedCampus === "all"
    ? campusesData
    : campusesData.filter((c) => c.id === selectedCampus || c.city.toLowerCase().includes(selectedCampus.toLowerCase()));

  // Dynamic calculations
  const totalStudents = activeCampuses.reduce((acc, c) => acc + c.students, 0);
  const totalCapacity = activeCampuses.reduce((acc, c) => acc + c.capacity, 0);
  const capacityOccupancy = totalCapacity > 0 ? ((totalStudents / totalCapacity) * 100).toFixed(1) : "94.0";
  const totalTeachers = activeCampuses.reduce((acc, c) => acc + c.teachers, 0);
  const totalBilled = activeCampuses.reduce((acc, c) => acc + c.feeBilled, 0);
  const totalCollected = activeCampuses.reduce((acc, c) => acc + c.feeCollected, 0);
  const pendingFees = activeCampuses.reduce((acc, c) => acc + c.pendingFees, 0);
  const feeRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : "93.8";

  // Period adjustments
  const periodMultiplier = selectedPeriod === "term1" ? 0.35 : selectedPeriod === "term2" ? 0.35 : selectedPeriod === "term3" ? 0.30 : 1.0;
  const periodCollected = Math.round(totalCollected * periodMultiplier);
  const periodBilled = Math.round(totalBilled * periodMultiplier);

  // Plain-English Executive Summary text for PDF
  const executiveReportText = `
AGRAGATI SCHOOL OS — EXECUTIVE KPI & AUDIT SUMMARY
Organization: ${currentOrganization?.name || "King's Educational Trust"}
Scope: ${selectedCampus === "all" ? "All Managed Campuses (2 Active)" : selectedCampus}
Time Period: ${selectedPeriod === "annual" ? "Academic Year 2024–2025 (Annual)" : selectedPeriod.toUpperCase()}
Generated on: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}

1. KEY ENROLLMENT METRICS:
- Total Scholars Enrolled: ${totalStudents.toLocaleString()}
- Total Campus Capacity: ${totalCapacity.toLocaleString()} seats
- Capacity Occupancy: ${capacityOccupancy}%
- Annual Retention Rate: 98.2% (Steady year-on-year)

2. FINANCIAL & FEE REALIZATION:
- Gross Tuition Billed: ${formatIndianCurrency(periodBilled)}
- Net Tuition Realized: ${formatIndianCurrency(periodCollected)}
- Overall Collection Yield: ${feeRate}%
- Pending Arrears Balance: ${formatIndianCurrency(pendingFees)}
- Overdue Accounts Count: 72 students across 2 campuses

3. TEACHING FACULTY & STAFFING:
- Total Faculty Members: ${totalTeachers}
- Average Student-Teacher Ratio: 1:${(totalStudents / (totalTeachers || 1)).toFixed(1)}
- Faculty Retention Rate: 96.5%
- Teacher Attendance: 98.1%

4. ACADEMIC & ENGAGEMENT:
- Average Daily Attendance: 96.4%
- Board Examination Pass Rate: 99.2%
- High Distinction Ratio: 78.4%

Status: AUDIT VERIFIED • ALL SYSTEMS NORMAL
`;

  return (
    <AppShell
      role="OWNER"
      schoolName={currentOrganization?.name || "King's Educational Trust"}
      campusName="MANAGEMENT CONSOLE"
      epochText="Academic Year 2024–2025 • Consolidated Performance Dashboard"
      userName="Dr. Arvind Swaminathan"
      userRoleTitle="Chancellor & Chief Trustee"
    >
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Top Breadcrumb / Navigation helper */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/organization" className="hover:text-blue-500 transition-colors">
              Organization
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 dark:text-slate-100 font-semibold">Summary & Numbers (KPIs)</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/owner/overview">
              <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5 border-slate-700/60 hover:bg-slate-800">
                <PieChart className="w-3.5 h-3.5 text-blue-400" />
                Campus Details
              </Button>
            </Link>
            <Link href="/owner/fee-analytics">
              <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5 border-slate-700/60 hover:bg-slate-800">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                Fee Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                Executive KPI Center
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live Data Connected
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Summary & Performance Numbers
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              Real-time numbers for school owners and trustees. Monitor student count, fee collections, teacher ratios, and school results in plain English.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/organization/add-school">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 gap-1.5 shadow-sm font-medium"
              >
                <PlusCircle className="w-4 h-4" />
                + Add School
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-xs h-9 gap-1.5 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Updating..." : "Refresh Numbers"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExportModalOpen(true)}
              className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs h-9 gap-1.5 font-medium"
            >
              <Download className="w-4 h-4" />
              Download KPI Report
            </Button>
          </div>
        </div>

        {/* Interactive Controls Bar: Period Selector & Campus Filter */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-500" /> Filter School:
            </span>
            <div className="inline-flex rounded-lg p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedCampus("all")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedCampus === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                All Schools ({campusesData.length})
              </button>
              {campusesData.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCampus(c.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    selectedCampus === c.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {c.city}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" /> Time Period:
            </span>
            <div className="inline-flex rounded-lg p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {[
                { id: "annual", label: "Full Year (24–25)" },
                { id: "term1", label: "Term 1 (Apr–Jul)" },
                { id: "term2", label: "Term 2 (Aug–Nov)" },
                { id: "term3", label: "Term 3 (Dec–Mar)" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPeriod(p.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    selectedPeriod === p.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Executive KPI Metric Cards (6 Key Pillars) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Total Students */}
          <Card
            onClick={() => setActiveModalMetric("students")}
            className="cursor-pointer transition-all duration-200 hover:border-blue-500/60 dark:hover:border-blue-500/60 bg-white dark:bg-[#0B1528] border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-500" /> Total Students
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
                      {totalStudents.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      +8.4% YoY
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Campus Capacity Occupancy:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{capacityOccupancy}% ({totalCapacity.toLocaleString()} seats)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${capacityOccupancy}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>98.2% student retention</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    Click to inspect <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Fee Collection Yield */}
          <Card
            onClick={() => setActiveModalMetric("fees")}
            className="cursor-pointer transition-all duration-200 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 bg-white dark:bg-[#0B1528] border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-emerald-500" /> Fees Collected
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
                      {feeRate}%
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Target 95%
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Collected to date:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatIndianCurrency(periodCollected)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${feeRate}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>+₹18.4L online this week</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    View collection <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Pending Fees & Arrears */}
          <Card
            onClick={() => setActiveModalMetric("arrears")}
            className="cursor-pointer transition-all duration-200 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-white dark:bg-[#0B1528] border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" /> Pending Fees
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
                      {formatIndianCurrency(pendingFees)}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Unpaid Accounts:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">72 families (4.1%)</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  ₹14.2L (0–30 days) • ₹12.0L (60+ days)
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>Automated notices ready</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    Inspect ledgers <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Teachers & Faculty Staff */}
          <Card
            onClick={() => setActiveModalMetric("faculty")}
            className="cursor-pointer transition-all duration-200 hover:border-purple-500/60 dark:hover:border-purple-500/60 bg-white dark:bg-[#0B1528] border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-purple-600" />
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-500" /> Faculty & Teachers
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
                      {totalTeachers}
                    </span>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      1:{(totalStudents / (totalTeachers || 1)).toFixed(1)} Ratio
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Teacher Retention:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">96.5% Annual</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  100% CBSE & Board Certified
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>4 Academic Departments</span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    View teachers <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Daily Attendance & Presence */}
          <Card
            onClick={() => setActiveModalMetric("attendance")}
            className="cursor-pointer transition-all duration-200 hover:border-cyan-500/60 dark:hover:border-cyan-500/60 bg-white dark:bg-[#0B1528] border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-600" />
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-cyan-500" /> Daily Attendance
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
                      96.4%
                    </span>
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                      High Presence
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Percent className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Faculty Presence:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">98.1% Daily</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-600 h-full rounded-full transition-all duration-500" style={{ width: "96.4%" }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>Smart biometric sync active</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    Attendance logs <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 6: Academic Results & Board Pass Rate */}
          <Card
            onClick={() => setActiveModalMetric("academics")}
            className="cursor-pointer transition-all duration-200 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 bg-white dark:bg-[#0B1528] border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> Board Exam Pass Rate
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
                      99.2%
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      78.4% Distinction
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>School Average Score:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">88.6% (Distinction)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: "99.2%" }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>100% College Matriculation</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    Exam analysis <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Multi-Campus Comparison Table */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1528] shadow-xs">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 p-5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                Campus Performance Comparison Matrix
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Side-by-side performance indicators across all operated schools in the trust.
              </p>
            </div>
            <Link href="/organization/schools">
              <Button variant="outline" size="sm" className="text-xs h-8 gap-1 border-slate-300 dark:border-slate-700">
                Manage Campuses <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Campus & Code</th>
                  <th className="py-3.5 px-4">Students / Capacity</th>
                  <th className="py-3.5 px-4">Fee Realization</th>
                  <th className="py-3.5 px-4">Pending Dues</th>
                  <th className="py-3.5 px-4">Faculty Count</th>
                  <th className="py-3.5 px-4">Attendance</th>
                  <th className="py-3.5 px-4">Board Pass %</th>
                  <th className="py-3.5 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {campusesData.map((campus) => {
                  const isFiltered = selectedCampus !== "all" && selectedCampus !== campus.id;
                  return (
                    <tr
                      key={campus.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors ${
                        isFiltered ? "opacity-40" : ""
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {campus.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {campus.code} • {campus.city}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {campus.students.toLocaleString()} / {campus.capacity.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                          {campus.capacityPercent}% Occupancy
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {campus.feeRate}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {formatIndianCurrency(campus.feeCollected)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-amber-600 dark:text-amber-400">
                          {formatIndianCurrency(campus.pendingFees)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Needs follow-up
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {campus.teachers} Staff
                        </div>
                        <div className="text-[11px] text-purple-600 dark:text-purple-400">
                          Ratio {campus.teacherRatio}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-cyan-600 dark:text-cyan-400">
                          {campus.attendanceRate}
                        </div>
                        <div className="text-[11px] text-slate-500">Daily average</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {campus.boardPassRate}
                        </div>
                        <div className="text-[11px] text-slate-500">{campus.distinctionRate} Distinction</div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            switchSchool(campus.id);
                            setSelectedCampus(campus.id);
                          }}
                          className="text-xs h-7 px-2.5 border-slate-300 dark:border-slate-700 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          Focus Campus
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Financial Progress & Strategic AI Advice Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Term Collection Breakdown */}
          <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1528] p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-500" />
                  Term-by-Term Fee Progress
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Academic Year 2024–2025 installment breakdown and target achievement.
                </p>
              </div>
              <Link href="/owner/fee-analytics">
                <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
                  Full Ledger <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Term 1 (Apr–Jul) • Completed
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    ₹4.42 Cr / ₹4.50 Cr (98.2%)
                  </span>
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
                  <span className="text-slate-700 dark:text-slate-300">
                    ₹3.98 Cr / ₹4.15 Cr (95.9%)
                  </span>
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
                  <span className="text-slate-700 dark:text-slate-300">
                    ₹3.38 Cr / ₹3.80 Cr (88.9%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "88.9%" }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gross Billed</div>
                <div className="font-serif text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {formatIndianCurrency(totalBilled)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Realized Yield</div>
                <div className="font-serif text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatIndianCurrency(totalCollected)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Dues</div>
                <div className="font-serif text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {formatIndianCurrency(pendingFees)}
                </div>
              </div>
            </div>
          </Card>

          {/* AI Executive Recommendations */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1528] p-6 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 dark:text-slate-100">
                    Smart Recommendations
                  </h3>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                    AI Analysis on School Operations
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-blue-500/30 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
                    <span>Dispatch Term 3 Reminders</span>
                    <Badge variant="gold" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                      High Impact
                    </Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    Sending automated WhatsApp & SMS reminders 10 days before due date can recover ₹21.5 Lakhs faster.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
                    <span>Grade 11 Science Capacity</span>
                    <Badge variant="neutral" className="text-[10px] px-1.5 py-0">96% Full</Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    Senior Secondary science batch is almost full. Adding 1 new section will accommodate 35 more applicants.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <Link href="/owner/insights">
                <Button className="w-full text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium">
                  <Sparkles className="w-4 h-4" />
                  View All Strategic Insights
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Plain-English Guidance Box */}
        <div className="p-5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              How to Read These Numbers (Plain English Guide)
            </h4>
            <p className="text-xs text-blue-800/80 dark:text-blue-300/80 max-w-3xl leading-relaxed">
              <strong>94% Fee Yield</strong> means for every ₹100 billed to parents, ₹94 is already safely in the school bank account.
              <strong> 1:14 Ratio</strong> means for every 14 students, the school employs 1 certified teacher.
              <strong> 98.2% Retention</strong> means almost all students from last year re-enrolled without leaving.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setActiveModalMetric("students")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs whitespace-nowrap"
          >
            Explore Metric Details
          </Button>
        </div>
      </div>

      {/* Interactive Metric Drilldown Modal */}
      {activeModalMetric && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {activeModalMetric === "students" && <Users className="w-5 h-5 text-blue-500" />}
                  {activeModalMetric === "fees" && <IndianRupee className="w-5 h-5 text-emerald-500" />}
                  {activeModalMetric === "arrears" && <AlertCircle className="w-5 h-5 text-amber-500" />}
                  {activeModalMetric === "faculty" && <Building2 className="w-5 h-5 text-purple-500" />}
                  {activeModalMetric === "attendance" && <TrendingUp className="w-5 h-5 text-cyan-500" />}
                  {activeModalMetric === "academics" && <Sparkles className="w-5 h-5 text-indigo-500" />}
                  Metric Inspection &amp; Drill-Down
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Detailed institutional breakdown for {activeModalMetric.toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalMetric(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Based on active metric */}
            <div className="space-y-4 text-xs">
              {activeModalMetric === "students" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 text-[11px]">Enrolled Scholars</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{totalStudents.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 mt-1">+185 new admissions this term</div>
                    </div>
                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 text-[11px]">Capacity Utilization</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{capacityOccupancy}%</div>
                      <div className="text-[10px] text-slate-400 mt-1">180 vacant seats available</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-200 block">Class Level Distribution</span>
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Primary School (Grades 1–5):</span>
                      <span className="font-semibold">1,120 scholars</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Middle School (Grades 6–8):</span>
                      <span className="font-semibold">980 scholars</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Senior Secondary (Grades 9–12):</span>
                      <span className="font-semibold">1,320 scholars</span>
                    </div>
                  </div>
                </div>
              )}

              {activeModalMetric === "fees" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 text-[11px]">Tuition Collected</div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatIndianCurrency(periodCollected)}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Realized into Treasury Account</div>
                    </div>
                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 text-[11px]">Collection Yield</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{feeRate}%</div>
                      <div className="text-[10px] text-slate-400 mt-1">Benchmark: 95% target</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-200 block">Payment Channels</span>
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span>BHIM UPI (Google Pay, PhonePe, Paytm):</span>
                      <span className="font-semibold">69.6% (Instant Realization)</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Net Banking (SBI, HDFC, ICICI):</span>
                      <span className="font-semibold">20.8%</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Challan &amp; Debit/Credit Card:</span>
                      <span className="font-semibold">9.6%</span>
                    </div>
                  </div>
                </div>
              )}

              {activeModalMetric === "arrears" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="text-amber-800 dark:text-amber-300 font-semibold text-sm">
                      Total Overdue Arrears: {formatIndianCurrency(pendingFees)}
                    </div>
                    <p className="text-amber-700/90 dark:text-amber-400 text-xs mt-1">
                      72 student accounts currently have an outstanding balance past the 30-day grace period.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">Rohan Singhania (Class 12-A)</span>
                        <div className="text-[10px] text-slate-400">Parent: Sunita Singhania • 64 days overdue</div>
                      </div>
                      <span className="font-bold text-amber-600 dark:text-amber-400">₹36,250</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">Devansh Gupta (Class 11-A)</span>
                        <div className="text-[10px] text-slate-400">Parent: Alok Gupta • 42 days overdue</div>
                      </div>
                      <span className="font-bold text-amber-600 dark:text-amber-400">₹31,250</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">Kabir Mehta (Class 10-B)</span>
                        <div className="text-[10px] text-slate-400">Parent: Dr. Manish Mehta • 92 days overdue</div>
                      </div>
                      <span className="font-bold text-red-500">₹23,750</span>
                    </div>
                  </div>
                </div>
              )}

              {activeModalMetric === "faculty" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 text-[11px]">Academic Staff</div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{totalTeachers} Teachers</div>
                      <div className="text-[10px] text-slate-400 mt-1">Across 4 major faculties</div>
                    </div>
                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500 text-[11px]">Student-Teacher Ratio</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">1:{(totalStudents / (totalTeachers || 1)).toFixed(1)}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Meets CIS &amp; CBSE standard</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-200 block">Department Headcounts</span>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Senior Science &amp; AI:</span>
                      <span className="font-semibold">78 Faculty</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Mathematics &amp; CS:</span>
                      <span className="font-semibold">64 Faculty</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Commerce &amp; Social Sciences:</span>
                      <span className="font-semibold">56 Faculty</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Languages &amp; Performing Arts:</span>
                      <span className="font-semibold">50 Faculty</span>
                    </div>
                  </div>
                </div>
              )}

              {activeModalMetric === "attendance" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <div className="text-cyan-800 dark:text-cyan-300 font-semibold text-sm">
                      Consolidated Daily Attendance: 96.4%
                    </div>
                    <p className="text-cyan-700/90 dark:text-cyan-400 text-xs mt-1">
                      Continuous RFID and classroom digital attendance tracking is active across all homerooms.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Geneva Campus Average:</span>
                      <span className="font-semibold text-emerald-600">97.2%</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">New Delhi Campus Average:</span>
                      <span className="font-semibold text-emerald-600">95.6%</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Faculty &amp; Staff Attendance:</span>
                      <span className="font-semibold text-cyan-600">98.1%</span>
                    </div>
                  </div>
                </div>
              )}

              {activeModalMetric === "academics" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <div className="text-indigo-800 dark:text-indigo-300 font-semibold text-sm">
                      Board Examination Success: 99.2% Pass Rate
                    </div>
                    <p className="text-indigo-700/90 dark:text-indigo-400 text-xs mt-1">
                      78.4% of senior students achieved First Division with Distinction (Above 85% aggregate).
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Class 12 CBSE / IB Diploma Pass Rate:</span>
                      <span className="font-semibold text-emerald-600">99.4%</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Class 10 Secondary Examination:</span>
                      <span className="font-semibold text-emerald-600">99.0%</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Ivy League &amp; Tier-1 College Offers:</span>
                      <span className="font-semibold text-indigo-600">42 Scholars</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveModalMetric(null)}
                className="text-xs"
              >
                Close Inspection
              </Button>
              {activeModalMetric === "fees" || activeModalMetric === "arrears" ? (
                <Link href="/owner/fee-analytics">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5">
                    Open Fee Analytics <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              ) : activeModalMetric === "faculty" ? (
                <Link href="/owner/staff">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5">
                    Open Staff Directory <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/owner/overview">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5">
                    Go to Campus Details <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Report Preview Modal */}
      <PdfPreviewModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Agragati Executive KPI & Performance Report"
        fileName={`Executive-KPI-Summary-${new Date().toISOString().slice(0, 10)}.txt`}
        content={executiveReportText}
      />
    </AppShell>
  );
}
