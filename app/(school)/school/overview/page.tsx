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
  CheckCircle2,
  Clock,
  Bell,
  CheckSquare,
  ArrowUpRight,
  GraduationCap,
  CalendarDays,
  Shield,
  Send,
  Zap,
  Check,
} from "lucide-react";
import {
  fetchSchoolOperationsStats,
  fetchApprovalsQueue,
  fetchNoticesBulletins,
  SchoolOperationsStats,
  ExecutiveApprovalWarrant,
  CampusNoticeItem,
  updateApprovalStatus,
} from "@/lib/db/school-admin";
import { formatIndianCurrency } from "@/lib/utils";

export default function SchoolOverviewPage() {
  const [stats, setStats] = React.useState<SchoolOperationsStats | null>(null);
  const [warrants, setWarrants] = React.useState<ExecutiveApprovalWarrant[]>([]);
  const [notices, setNotices] = React.useState<CampusNoticeItem[]>([]);
  const [authorizedWarrants, setAuthorizedWarrants] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const [st, war, not] = await Promise.all([
          fetchSchoolOperationsStats(),
          fetchApprovalsQueue(),
          fetchNoticesBulletins(),
        ]);
        setStats(st);
        setWarrants(war);
        setNotices(not);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleQuickAuthorize = async (id: string) => {
    await updateApprovalStatus(id, "APPROVED");
    setAuthorizedWarrants((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <AppShell
      role="PRINCIPAL"
      userName="Dr. Arvind Swaminathan"
      userRoleTitle="Principal & Head of School"
      epochText="Term 2 (CBSE Board) • Main Enclave Campus"
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" dot>
                Institutional Operations Runtime
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                Delhi Public School, R.K. Puram • National Sovereign Enclave
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Daily Academic &amp; Campus Operations
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Real-time morning roll-call fidelity, daily BHIM UPI fee intake settlement, academic submission tracking, and immediate administrative approvals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/school/notices">
              <Button variant="outline" size="sm" className="font-sans gap-2 text-secondary border-secondary/40">
                <Bell className="w-4 h-4 text-secondary" />
                Draft Official Bulletin
              </Button>
            </Link>
            <Link href="/school/approvals">
              <Button variant="primary" size="sm" className="font-sans gap-2">
                <CheckSquare className="w-4 h-4 text-secondary-container" />
                Approvals Queue ({warrants.length})
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Operations KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-border/80 shadow-sm hover:border-secondary/40 transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Morning Roll-Call
              </span>
              <span className="font-sans text-xs font-bold text-[#3D5B42] bg-[#3D5B42]/10 px-2 py-0.5 rounded">
                97.4% Present
              </span>
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-primary">
                1,794 <span className="text-xs font-sans font-normal text-on-surface-variant">/ 1,842</span>
              </div>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                48 scholars excused / absent
              </p>
            </div>
          </Card>

          <Card className="p-5 border-border/80 shadow-sm hover:border-secondary/40 transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Approvals Queue
              </span>
              <Badge variant="gold">
                {warrants.filter((w) => !authorizedWarrants[w.id]).length} Pending
              </Badge>
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-secondary">
                5 Warrants
              </div>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                1 Discretionary Fee Waiver
              </p>
            </div>
          </Card>

          <Card className="p-5 border-border/80 shadow-sm hover:border-secondary/40 transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Active Class Sections
              </span>
              <GraduationCap className="w-5 h-5 text-secondary" />
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-primary">
                64 Roster Units
              </div>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                Classes 1–12 (NEP 2020 Stages)
              </p>
            </div>
          </Card>

          <Card className="p-5 border-border/80 shadow-sm hover:border-secondary/40 transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Daily Fee Settlement
              </span>
              <span className="text-xs font-bold text-secondary">INR (₹)</span>
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-[#3D5B42]">
                ₹4,26,000
              </div>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                BHIM UPI &amp; Bank Feeds Reconciled
              </p>
            </div>
          </Card>
        </div>

        {/* Live Roll-Call by House & Urgent Warrants Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* House Attendance Breakdown */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h3 className="font-serif text-lg font-medium text-primary">
                  Morning Roll-Call by House
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Biometric turnstile check-in at 08:30 CET
                </p>
              </div>
              <Badge variant="active">Live Radar</Badge>
            </div>

            <div className="space-y-4 font-sans text-xs">
              {stats?.houseAttendance.map((h) => (
                <div key={h.house} className="space-y-1.5">
                  <div className="flex justify-between font-medium">
                    <span className="text-primary truncate max-w-[200px]">{h.house}</span>
                    <span className="font-bold text-[#3D5B42]">{h.rate}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>{h.present} Present</span>
                    <span>{h.total} Total</span>
                  </div>
                  <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div className="bg-[#3D5B42] h-full rounded-full" style={{ width: h.rate }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pending Executive Warrants Desk */}
          <Card className="lg:col-span-2 p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h3 className="font-serif text-xl font-medium text-primary">
                  Executive Warrant Approvals Desk
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Institutional sign-off required for bursaries, leave requests, and official publications.
                </p>
              </div>
              <Link href="/school/approvals">
                <Button variant="ghost" size="sm" className="text-xs text-secondary gap-1">
                  View All ({warrants.length}) <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3 font-sans text-xs">
              {warrants.slice(0, 3).map((war) => {
                const isApproved = authorizedWarrants[war.id];

                return (
                  <div
                    key={war.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isApproved
                        ? "bg-[#3D5B42]/10 border-[#3D5B42]/40"
                        : "bg-surface-variant/30 border-border/70 hover:border-secondary/40"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-base font-semibold text-primary">
                            {war.title}
                          </span>
                          <Badge variant={isApproved ? "active" : "gold"}>
                            {isApproved ? "Authorized" : "Pending"}
                          </Badge>
                        </div>
                        <div className="text-xs text-on-surface-variant mt-1">
                          Applicant: <strong className="text-primary">{war.applicant}</strong> ({war.applicantRole}) • {war.amountOrScope}
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-1 italic">
                          "{war.justification}"
                        </p>
                      </div>

                      <div className="shrink-0 pt-2 sm:pt-0">
                        {isApproved ? (
                          <span className="text-xs font-bold text-[#3D5B42] flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Signed
                          </span>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleQuickAuthorize(war.id)}
                            className="text-xs gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5" /> Authorize
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Campus Official Bulletins & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h3 className="font-serif text-xl font-medium text-primary">
                  Official Campus Bulletins &amp; Notices
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Published academic notices and emergency broadcasts.
                </p>
              </div>
              <Link href="/school/notices">
                <Button variant="ghost" size="sm" className="text-xs text-secondary gap-1">
                  Manage Bulletins <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3 font-sans text-xs">
              {notices.map((not) => (
                <div key={not.id} className="p-3.5 rounded-lg border border-border/70 bg-surface space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base font-semibold text-primary">{not.title}</span>
                      {not.isPinned && <Badge variant="gold">Pinned</Badge>}
                    </div>
                    <Badge variant={not.priority === "URGENT" ? "critical" : "navy"}>
                      {not.priority}
                    </Badge>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed text-[11px]">{not.content}</p>
                  <div className="text-[10px] text-on-surface-variant pt-1 border-t border-border/50 flex justify-between">
                    <span>By: {not.authorName} ({not.authorTitle})</span>
                    <span>{not.publishedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Access Matrix */}
          <div className="space-y-4">
            <Link href="/school/students" className="block">
              <Card className="p-4 hover:border-secondary/60 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary text-secondary-container flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-medium text-primary">Students Directory</h4>
                    <span className="font-sans text-xs text-on-surface-variant">1,842 Enrolled Scholars</span>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/school/classes" className="block">
              <Card className="p-4 hover:border-secondary/60 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary text-secondary-container flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-medium text-primary">Classes &amp; Sections</h4>
                    <span className="font-sans text-xs text-on-surface-variant">64 Form Sections &amp; Tutors</span>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/school/reports" className="block">
              <Card className="p-4 hover:border-secondary/60 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary text-secondary-container flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-medium text-primary">Reports &amp; Audits</h4>
                    <span className="font-sans text-xs text-on-surface-variant">Official Academic Logs</span>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
