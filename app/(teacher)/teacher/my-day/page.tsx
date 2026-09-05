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

export default function TeacherMyDayPage() {
  const [schedule, setSchedule] = React.useState<{
    sessions: TeacherPeriodSession[];
    metrics: any;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await fetchTeacherDaySchedule();
        setSchedule(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const previewContent = `DELHI PUBLIC SCHOOL, R.K. PURAM
FACULTY DAILY TIMETABLE & LECTURE SCHEDULE
Academic Session: 2024–2025 • Michaelmas Term 3

FACULTY DETAILS:
Faculty Member: Dr. Alistair Finch
Designation: Senior Master in Classical Humanities & Head of Department
Department: Senior Lyceum & Pure Mathematics
Staff ID: FAC-FINCH-104 • Room: Faculty Study Rm 104
Date of Schedule: Friday, 5 Sep 2026

SUMMARY METRICS:
Allocated Sessions Today: 4 Periods
Scholars Under Care: 106 Total
Daily Attendance Recorded: 98.1%
Master Office Consultation Hours: 13:00 – 14:00 IST (3 Scholars Booked)

PERIOD-BY-PERIOD SCHEDULE BREAKDOWN:
================================================================================
1. PERIOD 1 (08:30 – 10:00 IST) [Concluded]
   Class: Class 12-A — CBSE Senior Secondary Mathematics
   Hall / Lab: Physics Wing Rm 301
   Registered Scholars: 38 Scholars
   Lecture Topic: Vectors & Three-Dimensional Geometry (CBSE Unit 4)
   Roll-Call Status: Sealed (Present: 36, Late: 1, Excused: 1)

2. PERIOD 2 (10:15 – 11:45 IST) [In Session Now]
   Class: Class 11-A — Advanced Mathematics & Calculus
   Hall / Lab: Chemistry Wing Rm 304
   Registered Scholars: 39 Scholars
   Lecture Topic: Limits, Derivatives & Continuity (CBSE Unit 5)
   Roll-Call Status: Active Session in Progress

3. PERIOD 3 (13:00 – 14:00 IST) [Upcoming]
   Class: Faculty Remedial & Board Exam Mentorship
   Hall / Lab: Faculty Study Rm 104
   Registered Scholars: 8 Scholars
   Lecture Topic: CBSE Sample Papers Doubt Resolution & Answer Key Analysis
   Roll-Call Status: Scheduled (Register Pending)

4. PERIOD 4 (14:15 – 15:45 IST) [Upcoming]
   Class: Class 10-B — Secondary Mathematics Foundation
   Hall / Lab: Main Block Rm 102
   Registered Scholars: 40 Scholars
   Lecture Topic: Quadratic Equations & Arithmetic Progressions
   Roll-Call Status: Scheduled (Register Pending)
================================================================================

FACULTY DIRECTIVES & REMARKS:
- Ensure all NCERT Exemplar homework submissions for Class 12-A are graded by Thursday.
- Board Exam practical mock files for Class 12-A internal assessment to be cross-verified with External CBSE guidelines.

Digital Hash: DPS-RKP-FAC-TIMETABLE-2026-SEALED
Official Faculty Signature: Dr. Alistair Finch (Senior Master)`;

  return (
    <AppShell
      role="TEACHER"
      schoolName="The King's College & Academy"
      campusName="GENEVA CAMPUS"
      userName="Dr. Alistair Finch"
      userRoleTitle="Senior Master in Classical Humanities"
      epochText="Michaelmas Term 3 • Academic Year 2024–2025"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Header Section matching Image 1 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0F172A] dark:text-stone-100 flex items-center gap-2">
              Good Morning, Dr. Finch! <span className="text-2xl">👋</span>
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
                <span className="font-bold">Fri, 5 Sep 2026</span>
                <span className="text-[10px] text-slate-400 font-normal">Michaelmas Term 3</span>
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
          fileName="Faculty_Daily_Schedule_Dr_Alistair_Finch.pdf"
          content={previewContent}
          studentMeta={{
            name: "Dr. Alistair Finch",
            rollNumber: "Staff ID: FAC-FINCH-104",
            form: "Senior Master in Classical Humanities",
            house: "Department of Mathematics & Lyceum",
            institutionName: "DELHI PUBLIC SCHOOL, R.K. PURAM",
            institutionAffiliation: "Affiliated to Central Board of Secondary Education (CBSE) • Affiliation No: 2730017",
            institutionAddress: "Sector XII, R.K. Puram, New Delhi - 110022 • School Code: 85214",
            academicSession: "2024–2025",
          }}
        />

        {/* 4 Daily Faculty Metric Cards matching Image 1 */}
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
                      4
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
                  106
                </span>
                <span className="font-sans text-xs text-slate-500">
                  Total
                </span>
              </div>
              <div className="mt-1">
                <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  98.1% Attendance Recorded
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
                      14
                    </span>
                    <span className="font-sans text-xs text-slate-500">
                      Reports
                    </span>
                  </div>
                  <p className="font-sans text-[10px] text-slate-500 truncate mt-0.5">
                    Problem Set 4 (Tensor Calculus)
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
                Master Office Hours
              </span>
              <div className="font-serif text-xl font-bold text-slate-900 dark:text-stone-100 mt-0.5">
                13:00 – 14:00
              </div>
              <p className="font-sans text-[10px] text-slate-500 mt-0.5">
                3 Scholars Booked for Coaching
              </p>
            </div>
          </Card>
        </div>

        {/* Master Daily Schedule Timeline matching Image 1 */}
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
            {/* Period 1: Concluded */}
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-stone-300">
                    08:30 – 10:00 IST
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-stone-800 text-slate-700 dark:text-stone-300 text-[10px] font-bold">
                    Concluded
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif text-base font-bold text-slate-900 dark:text-stone-100">
                    Class 12-A – CBSE Senior Secondary Mathematics
                  </h4>
                  <div className="text-xs font-sans text-slate-500 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Physics Wing Rm 301
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      38 Scholars
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-700 dark:text-stone-300">
                      <BookMarked className="w-3.5 h-3.5 text-blue-600" />
                      Topic: Vectors &amp; Three-Dimensional Geometry (CBSE Unit 4)
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                <div className="px-4 py-2 rounded-xl bg-slate-200/80 dark:bg-stone-800 text-slate-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-slate-600" />
                  <span>Roll-Call Sealed</span>
                </div>
              </div>
            </div>

            {/* Period 2: In Session Now */}
            <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4 ring-1 ring-emerald-400/30">
              <div className="flex items-start gap-3.5">
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-stone-100">
                    10:15 – 11:45 IST
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                    In Session Now
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif text-base font-bold text-slate-900 dark:text-stone-100">
                    Class 11-A – Advanced Mathematics &amp; Calculus
                  </h4>
                  <div className="text-xs font-sans text-slate-600 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Chemistry Wing Rm 304
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      39 Scholars
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-800 dark:text-stone-200">
                      <BookMarked className="w-3.5 h-3.5 text-emerald-600" />
                      Topic: Limits, Derivatives &amp; Continuity (CBSE Unit 5)
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                <Link href="/teacher/attendance">
                  <Button
                    size="sm"
                    className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold gap-1.5 shadow-xs"
                  >
                    <Users className="w-4 h-4" />
                    Mark Session Roll-Call
                  </Button>
                </Link>
              </div>
            </div>

            {/* Period 3: Upcoming */}
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-stone-300">
                    13:00 – 14:00 IST
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                    Upcoming
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif text-base font-bold text-slate-900 dark:text-stone-100">
                    Faculty Remedial &amp; Board Exam Mentorship
                  </h4>
                  <div className="text-xs font-sans text-slate-500 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Faculty Study Rm 104
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      8 Scholars
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-700 dark:text-stone-300">
                      <BookMarked className="w-3.5 h-3.5 text-blue-600" />
                      Topic: CBSE Sample Papers Doubt Resolution &amp; Answer Key Analysis
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                <Link href="/teacher/attendance">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold text-[#0A369D] border-[#0A369D]/30 bg-[#F0F5FF] hover:bg-[#E5EFFF] gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Prepare Register
                  </Button>
                </Link>
              </div>
            </div>

            {/* Period 4: Upcoming */}
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-stone-300">
                    14:15 – 15:45 IST
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                    Upcoming
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif text-base font-bold text-slate-900 dark:text-stone-100">
                    Class 10-B – Secondary Mathematics Foundation
                  </h4>
                  <div className="text-xs font-sans text-slate-500 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Main Block Rm 102
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      40 Scholars
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-700 dark:text-stone-300">
                      <BookMarked className="w-3.5 h-3.5 text-blue-600" />
                      Topic: Quadratic Equations &amp; Arithmetic Progressions
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                <Link href="/teacher/attendance">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold text-[#0A369D] border-[#0A369D]/30 bg-[#F0F5FF] hover:bg-[#E5EFFF] gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Prepare Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* 3 Quick Navigation / Action Cards matching Image 1 */}
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
                    Inspect 4 assigned courses, syllabus milestones, and average academic grades.
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
                    14 student submissions awaiting evaluation and feedback comments.
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
