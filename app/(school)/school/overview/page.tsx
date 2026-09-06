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
import { useAuth } from "@/components/providers/auth-context";

export default function SchoolOverviewPage() {
  const { school, profile } = useAuth();
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
      userName={profile?.full_name || "School Principal"}
      userRoleTitle="Principal & Head of School"
      epochText={school?.name ? `${school.name} • Academic Operations` : "Academic Operations"}
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="navy" dot>
                Daily School Operations
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                {school?.name || "School Campus"}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Daily Academic &amp; Campus Operations
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Live student attendance, daily fee collection, class progress, and pending approvals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/school/notices">
              <Button variant="outline" size="sm" className="font-sans gap-2 text-primary border-border hover:bg-surface-variant">
                <Bell className="w-4 h-4 text-blue-500" />
                + Post Notice
              </Button>
            </Link>
            <Link href="/school/approvals">
              <Button variant="primary" size="sm" className="font-sans gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <CheckSquare className="w-4 h-4" />
                Approvals Queue ({warrants.length})
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Operations KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-border/80 shadow-sm hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Student Attendance
              </span>
              <span className="font-sans text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                {stats?.morningAttendanceRate || "0.0%"} Present
              </span>
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-primary">
                {stats?.presentCount || 0} <span className="text-xs font-sans font-normal text-on-surface-variant">/ {stats?.totalStudents || 0}</span>
              </div>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                {Math.max(0, (stats?.totalStudents || 0) - (stats?.presentCount || 0))} students absent or excused
              </p>
            </div>
          </Card>

          <Card className="p-5 border-border/80 shadow-sm hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Approvals Queue
              </span>
              <Badge variant="navy">
                {warrants.filter((w) => !authorizedWarrants[w.id]).length} Pending
              </Badge>
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-blue-400">
                {warrants.filter((w) => !authorizedWarrants[w.id]).length} Requests
              </div>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                Awaiting executive action
              </p>
            </div>
          </Card>

          <Card className="p-5 border-border/80 shadow-sm hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Active Classes
              </span>
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-primary">
                {stats?.activeRosterUnits || 0} Classes
              </div>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                Active class sections
              </p>
            </div>
          </Card>

          <Card className="p-5 border-border/80 shadow-sm hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider">
                Today's Fee Collection
              </span>
              <span className="text-xs font-bold text-blue-400">INR (₹)</span>
            </div>
            <div className="mt-3">
              <div className="font-serif text-3xl font-medium text-emerald-400">
                {formatIndianCurrency(stats?.dailyVaultSettlement || 0)}
              </div>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                Settlements received
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
                  Today's Attendance by House
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Morning check-in at 8:30 AM
                </p>
              </div>
              <Badge variant="active">Live</Badge>
            </div>

            <div className="space-y-4 font-sans text-xs">
              {(!stats?.houseAttendance || stats.houseAttendance.length === 0) ? (
                <div className="py-8 text-center text-on-surface-variant">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="font-medium text-xs">No house attendance recorded today</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Records will appear once roll-call is marked.</p>
                </div>
              ) : (
                stats.houseAttendance.map((h) => (
                  <div key={h.house} className="space-y-1.5">
                    <div className="flex justify-between font-medium">
                      <span className="text-primary truncate max-w-[200px]">{h.house}</span>
                      <span className="font-bold text-emerald-400">{h.rate}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-on-surface-variant">
                      <span>{h.present} Present</span>
                      <span>{h.total} Total</span>
                    </div>
                    <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: h.rate }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Pending Executive Warrants Desk */}
          <Card className="lg:col-span-2 p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h3 className="font-serif text-xl font-medium text-primary">
                  Pending Staff &amp; Student Approvals
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Requests needing principal approval for fee waivers, staff leaves, and notices.
                </p>
              </div>
              <Link href="/school/approvals">
                <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300 gap-1">
                  View All ({warrants.length}) <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3 font-sans text-xs">
              {warrants.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-500" />
                  <p className="font-medium text-xs">No pending approvals</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">All staff and student requests have been cleared.</p>
                </div>
              ) : (
                warrants.slice(0, 3).map((war) => {
                  const isApproved = authorizedWarrants[war.id];

                return (
                  <div
                    key={war.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isApproved
                        ? "bg-emerald-950/20 border-emerald-500/40"
                        : "bg-surface-variant/30 border-border/70 hover:border-blue-500/40"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-base font-semibold text-primary">
                            {war.title}
                          </span>
                          <Badge variant={isApproved ? "active" : "navy"}>
                            {isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                        <div className="text-xs text-on-surface-variant mt-1">
                          Requested by: <strong className="text-primary">{war.applicant}</strong> ({war.applicantRole}) • {war.amountOrScope}
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-1 italic">
                          "{war.justification}"
                        </p>
                      </div>

                      <div className="shrink-0 pt-2 sm:pt-0">
                        {isApproved ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Approved
                          </span>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleQuickAuthorize(war.id)}
                            className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Zap className="w-3.5 h-3.5" /> Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>
          </Card>
        </div>

        {/* Campus Official Bulletins & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <h3 className="font-serif text-xl font-medium text-primary">
                  School Notices &amp; Announcements
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Recent announcements for students, parents, and teachers.
                </p>
              </div>
              <Link href="/school/notices">
                <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300 gap-1">
                  View All Notices <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3 font-sans text-xs">
              {notices.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="font-medium text-xs">No campus notices</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Published announcements will appear here.</p>
                </div>
              ) : (
                notices.map((not) => (
                  <div key={not.id} className="p-3.5 rounded-lg border border-border/70 bg-surface space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-base font-semibold text-primary">{not.title}</span>
                        {not.isPinned && <Badge variant="navy">Pinned</Badge>}
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
                ))
              )}
            </div>
          </Card>

          {/* Quick Access Matrix */}
          <div className="space-y-4">
            <Link href="/school/students" className="block">
              <Card className="p-4 hover:border-blue-500/60 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-medium text-primary">Students Directory</h4>
                    <span className="font-sans text-xs text-on-surface-variant">{stats?.totalStudents || 0} Students Enrolled</span>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/school/classes" className="block">
              <Card className="p-4 hover:border-blue-500/60 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-medium text-primary">Classes &amp; Sections</h4>
                    <span className="font-sans text-xs text-on-surface-variant">{stats?.activeRosterUnits || 0} Classes &amp; Teachers</span>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/school/reports" className="block">
              <Card className="p-4 hover:border-blue-500/60 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-medium text-primary">Reports &amp; Audits</h4>
                    <span className="font-sans text-xs text-on-surface-variant">School Performance &amp; Attendance</span>
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
