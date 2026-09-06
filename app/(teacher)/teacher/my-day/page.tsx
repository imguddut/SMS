"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  BookOpen,
  FileCheck2,
  Building2,
  ArrowRight,
  UserCheck,
  Zap,
  Sparkles,
  ArrowUpRight,
  Printer,
  FileText,
  ChevronRight,
  Sprout,
  Check,
  GraduationCap,
  BarChart3,
  MapPin,
  BookMarked,
} from "lucide-react";
import {
  fetchTeacherDaySchedule,
  TeacherPeriodSession,
} from "@/lib/db/teacher";
import { PdfPreviewModal } from "@/components/ui/pdf-preview-modal";
import { TeacherQuoteBanner } from "@/components/ui/teacher-quote-banner";
import { useAuth } from "@/components/providers/auth-context";

export default function TeacherMyDayPage() {
  const { user, profile, school } = useAuth();
  const [schedule, setSchedule] = React.useState<{
    sessions: TeacherPeriodSession[];
    metrics: any;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await fetchTeacherDaySchedule(user?.id);
        setSchedule(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  const teacherName = profile?.full_name || "Faculty Member";
  const teacherDesignation = profile?.role || "Faculty";
  const schoolDisplayName = school?.name || "School Portal";

  const previewContent = `${schoolDisplayName.toUpperCase()}
FACULTY DAILY TIMETABLE & LECTURE SCHEDULE
Generated: ${new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

FACULTY DETAILS:
Faculty Member: ${teacherName}
Designation: ${teacherDesignation}
Staff ID: ${user?.id || "N/A"}

SUMMARY METRICS:
Allocated Sessions Today: ${schedule?.metrics?.allocatedSessions ?? schedule?.sessions?.length ?? 0} Periods
Scholars Under Care: ${schedule?.metrics?.scholarsUnderCare ?? 0} Total
Daily Attendance Recorded: ${schedule?.metrics?.attendanceRateToday ?? "0.0%"}
Office Hours: ${schedule?.metrics?.officeHours ?? "None"}

PERIOD-BY-PERIOD SCHEDULE BREAKDOWN:
================================================================================
${(schedule?.sessions || []).length > 0
  ? (schedule?.sessions || []).map((s, idx) => `${idx + 1}. PERIOD ${s.periodNumber} (${s.timeRange}) [${s.status}]
   Class: ${s.className}
   Hall / Lab: ${s.roomNumber}
   Topic: ${s.topic}`).join("\n\n")
  : "No scheduled teaching periods recorded for today."}
================================================================================

Official Faculty Signature: ${teacherName}`;

  return (
    <AppShell
      role="TEACHER"
      schoolName={schoolDisplayName}
      campusName={school?.code || "MAIN CAMPUS"}
      userName={teacherName}
      userRoleTitle={teacherDesignation}
      epochText={new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0F172A] dark:text-stone-100 flex items-center gap-2">
              Good Morning, {teacherName.split(" ")[0]}! <span className="text-2xl">👋</span>
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#64748B] dark:text-stone-400 mt-1">
              Here&apos;s your schedule and teaching updates for today.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Pill Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-stone-800/80 border border-slate-200/80 dark:border-stone-700 text-xs font-semibold text-slate-700 dark:text-stone-300 shadow-xs">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold">{new Date().toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="text-[10px] text-slate-400 font-normal">Daily Schedule</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              className="font-sans gap-2 text-slate-700 hover:text-slate-900 border-slate-300 dark:border-stone-700 text-xs shadow-xs"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              Export Agenda (PDF)
            </Button>

            <Link href="/teacher/homework/new">
              <Button
                variant="outline"
                size="sm"
                className="font-sans gap-2 text-[#0A369D] hover:text-[#082975] border-[#0A369D]/30 bg-[#F0F5FF] hover:bg-[#E5EFFF] text-xs font-semibold shadow-xs"
              >
                <BookOpen className="w-4 h-4 text-[#0A369D]" />
                Assign Homework
              </Button>
            </Link>

            <Link href="/teacher/attendance">
              <Button
                size="sm"
                className="font-sans gap-2 bg-[#0A369D] hover:bg-[#082975] text-white text-xs font-semibold shadow-xs"
              >
                <Users className="w-4 h-4 text-white" />
                Mark Roll-Call Now
              </Button>
            </Link>
          </div>
        </div>

        {/* Pdf Preview Modal */}
        <PdfPreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title="Faculty Daily Timetable & Schedule"
          fileName={`Faculty_Daily_Schedule_${teacherName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`}
          content={previewContent}
          studentMeta={{
            name: teacherName,
            rollNumber: `Staff ID: ${user?.id || "N/A"}`,
            form: teacherDesignation,
            house: school?.name || "Faculty",
            institutionName: schoolDisplayName,
            institutionAffiliation: school?.code || "",
            institutionAddress: "",
            academicSession: new Date().getFullYear().toString(),
          }}
        />

        {/* 4 Daily Faculty Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today's Sessions */}
          <Link href="/teacher/my-day">
            <Card className="p-4 rounded-2xl border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Today&apos;s Sessions
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-serif text-2xl font-bold text-slate-900 dark:text-stone-100">
                      {schedule?.metrics?.allocatedSessions ?? schedule?.sessions?.length ?? 0}
                    </span>
                    <span className="font-sans text-xs text-slate-500">
                      Allocated
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </Card>
          </Link>

          {/* Card 2: Scholars Under Care */}
          <Card className="p-4 rounded-2xl border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Scholars Under Care
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-serif text-2xl font-bold text-slate-900 dark:text-stone-100">
                  {schedule?.metrics?.scholarsUnderCare ?? 0}
                </span>
                <span className="font-sans text-xs text-slate-500">
                  Total
                </span>
              </div>
              <div className="mt-1">
                <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  {schedule?.metrics?.attendanceRateToday ?? "0.0%"} Attendance Recorded
                </span>
              </div>
            </div>
          </Card>

          {/* Card 3: Pending Marking */}
          <Link href="/teacher/homework/review">
            <Card className="p-4 rounded-2xl border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <span className="font-sans text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
                    Pending Marking
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-serif text-2xl font-bold text-amber-700 dark:text-amber-400">
                      {schedule?.metrics?.pendingMarking ?? 0}
                    </span>
                    <span className="font-sans text-xs text-slate-500">
                      Assignments
                    </span>
                  </div>
                  <p className="font-sans text-[10px] text-slate-500 truncate mt-0.5">
                    Awaiting Evaluation
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
            </Card>
          </Link>

          {/* Card 4: Master Office Hours */}
          <Card className="p-4 rounded-2xl border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Office Hours
              </span>
              <div className="font-serif text-xl font-bold text-slate-900 dark:text-stone-100 mt-0.5">
                {schedule?.metrics?.officeHours ?? "None"}
              </div>
              <p className="font-sans text-[10px] text-slate-500 mt-0.5">
                Faculty Consultation
              </p>
            </div>
          </Card>
        </div>

        {/* Master Daily Schedule Timeline */}
        <Card className="p-6 rounded-2xl border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-stone-100">
                  Today&apos;s Timetable
                </h3>
                <p className="font-sans text-xs text-slate-500 dark:text-stone-400">
                  Your period-by-period schedule, classroom details and topics.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              className="text-xs font-semibold text-slate-700 gap-1.5"
            >
              <span>View Full Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="space-y-3.5">
            {(schedule?.sessions || []).length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-stone-800 text-slate-500 dark:text-stone-400 text-sm">
                No timetable sessions scheduled for today.
              </div>
            ) : (
              (schedule?.sessions || []).map((session, idx) => (
                <div
                  key={session.id || idx}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    session.status === "ACTIVE_NOW"
                      ? "border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-400/30"
                      : session.status === "COMPLETED"
                      ? "border-slate-200/80 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-900/30"
                      : "border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          session.status === "ACTIVE_NOW"
                            ? "bg-emerald-500 animate-pulse"
                            : session.status === "COMPLETED"
                            ? "bg-slate-400"
                            : "bg-blue-500"
                        }`}
                      />
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-stone-300">
                        {session.timeRange}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          session.status === "ACTIVE_NOW"
                            ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                            : session.status === "COMPLETED"
                            ? "bg-slate-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300"
                            : "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                        }`}
                      >
                        {session.status === "ACTIVE_NOW"
                          ? "In Session Now"
                          : session.status === "COMPLETED"
                          ? "Concluded"
                          : "Upcoming"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-serif text-base font-bold text-slate-900 dark:text-stone-100">
                        {session.className}
                      </h4>
                      <div className="text-xs font-sans text-slate-500 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {session.roomNumber}
                        </span>
                        {session.enrolledCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {session.enrolledCount} Scholars
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-700 dark:text-stone-300">
                          <BookMarked className="w-3.5 h-3.5 text-blue-600" />
                          Topic: {session.topic}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                    {session.status === "COMPLETED" ? (
                      <div className="px-4 py-2 rounded-xl bg-slate-200/80 dark:bg-stone-800 text-slate-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-slate-600" />
                        <span>Roll-Call Sealed</span>
                      </div>
                    ) : (
                      <Link href="/teacher/attendance">
                        <Button
                          size="sm"
                          className={`text-xs font-semibold gap-1.5 shadow-xs ${
                            session.status === "ACTIVE_NOW"
                              ? "bg-[#059669] hover:bg-[#047857] text-white"
                              : "text-[#0A369D] border-[#0A369D]/30 bg-[#F0F5FF] hover:bg-[#E5EFFF]"
                          }`}
                          variant={session.status === "ACTIVE_NOW" ? "default" : "outline"}
                        >
                          <Users className="w-4 h-4" />
                          {session.status === "ACTIVE_NOW" ? "Mark Session Roll-Call" : "Prepare Register"}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* 3 Quick Navigation / Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/teacher/classes">
            <Card className="p-5 rounded-2xl border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] shadow-xs hover:shadow-md transition-all cursor-pointer h-full flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-slate-900 dark:text-stone-100">
                    My Classes &amp; Rosters
                  </h4>
                  <p className="font-sans text-xs text-slate-500 dark:text-stone-400 mt-0.5">
                    Inspect assigned courses, syllabus milestones, and rosters.
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-stone-800 flex items-center justify-center text-slate-400 group-hover:bg-[#0A369D] group-hover:text-white transition-all shrink-0 ml-2">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Card>
          </Link>

          <Link href="/teacher/homework/review">
            <Card className="p-5 rounded-2xl border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] shadow-xs hover:shadow-md transition-all cursor-pointer h-full flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-slate-900 dark:text-stone-100">
                    Homework Review Desk
                  </h4>
                  <p className="font-sans text-xs text-slate-500 dark:text-stone-400 mt-0.5">
                    {schedule?.metrics?.pendingMarking ?? 0} submissions awaiting evaluation and feedback.
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-stone-800 flex items-center justify-center text-slate-400 group-hover:bg-[#0A369D] group-hover:text-white transition-all shrink-0 ml-2">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Card>
          </Link>

          <Link href="/teacher/marks">
            <Card className="p-5 rounded-2xl border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] shadow-xs hover:shadow-md transition-all cursor-pointer h-full flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-slate-900 dark:text-stone-100">
                    Sealed Gradebook Matrix
                  </h4>
                  <p className="font-sans text-xs text-slate-500 dark:text-stone-400 mt-0.5">
                    Enter and sign off on Paper 1, Paper 2, and Internal Assessment marks.
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-stone-800 flex items-center justify-center text-slate-400 group-hover:bg-[#0A369D] group-hover:text-white transition-all shrink-0 ml-2">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Card>
          </Link>
        </div>

        {/* Motivational Quote Banner matching Image 1 */}
        <TeacherQuoteBanner
          icon={<Sprout className="w-6 h-6 text-white" />}
          iconBgClass="bg-[#0284C7] text-white"
          title="Teach Today. Empower Tomorrow."
          subtitle="Better teachers build brighter futures."
          quote="Education is not just about subjects, but about shaping lives."
        />
      </div>
    </AppShell>
  );
}
