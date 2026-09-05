"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  ArrowRight,
  UserCheck,
  Award,
  FileSpreadsheet,
  FileText,
  Download,
  Plus,
  BarChart3,
  TrendingUp,
  MapPin,
  CheckCircle2,
  BookmarkCheck,
  Edit3,
} from "lucide-react";
import {
  fetchTeacherClasses,
  TeacherClassOverview,
} from "@/lib/db/teacher";
import { PdfPreviewModal } from "@/components/ui/pdf-preview-modal";
import { TeacherQuoteBanner } from "@/components/ui/teacher-quote-banner";

export default function TeacherClassesPage() {
  const [classes, setClasses] = React.useState<TeacherClassOverview[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<{ title: string; fileName: string; content: string }>({
    title: "",
    fileName: "",
    content: "",
  });

  React.useEffect(() => {
    async function load() {
      try {
        const data = await fetchTeacherClasses();
        setClasses(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExportDirectory = () => {
    const text = `DELHI PUBLIC SCHOOL, R.K. PURAM
OFFICIAL FACULTY COURSE ALLOCATIONS & SYLLABUS DIRECTORY
Academic Session: 2024–2025 • Michaelmas Term 3

FACULTY MASTER RECORD:
Faculty Member: Dr. Alistair Finch
Designation: Senior Master in Classical Humanities & Head of Department
Total Courses Assigned: 4 Form Courses
Total Registered Scholars: 153 Scholars
Curriculum Framework: Central Board of Secondary Education (CBSE)

ALLOCATED COURSES & ACADEMIC STATUS:
================================================================================
1. COURSE: Class 12-A — Advanced Pure Mathematics & Physics
   Curriculum Code: CBSE_SCI • Room: Physics Wing Rm 301
   Registered Scholars: 38 Scholars
   Syllabus Completion: 94% (On Track for Board Practical & Pre-Boards)
   Cohort Performance: 89.4% (CBSE Average)
   Current Module: Vectors & 3D Geometry (CBSE Unit 4)
   Next Assignment: Integration by Parts & Definite Integrals (PS-06) (Due Monday, 17:00 IST)

2. COURSE: Class 12-B — Applied Mathematics for Commerce
   Curriculum Code: CBSE_COMM • Room: Commerce Wing Rm 204
   Registered Scholars: 36 Scholars
   Syllabus Completion: 91%
   Cohort Performance: 86.2% (CBSE Average)
   Current Module: Financial Mathematics & Linear Programming
   Next Assignment: Financial Mathematics & Annuity Problems (Due Tuesday, 16:00 IST)

3. COURSE: Class 11-A — Calculus & Coordinate Geometry
   Curriculum Code: CBSE_SCI • Room: Chemistry Wing Rm 304
   Registered Scholars: 39 Scholars
   Syllabus Completion: 82%
   Cohort Performance: 84.8% (CBSE Average)
   Current Module: Conic Sections & Differential Calculus
   Next Assignment: Conic Sections: Ellipse & Hyperbola Problem Set (Due Wednesday, 18:00 IST)

4. COURSE: Class 10-B — Secondary Mathematics Foundation
   Curriculum Code: CBSE_GEN • Room: Main Block Rm 102
   Registered Scholars: 40 Scholars
   Syllabus Completion: 88%
   Cohort Performance: 81.6% (CBSE Average)
   Current Module: Quadratic Equations, AP & Coordinate Geometry
   Next Assignment: Surface Areas and Volumes Board Exercises (Due Thursday, 14:00 IST)
================================================================================

ACADEMIC DIRECTIVES & SYLLABUS NOTES:
- Remedial mentorship sessions scheduled every Wednesday 13:00–14:00 IST for board exam candidates.
- Periodic term marks and IA components are sealed via Dilithium-5 sovereign cryptographic protocol.

Digital Hash: DPS-RKP-COURSE-DIR-2026-SEAL
Official Faculty Signature: Dr. Alistair Finch (Senior Master)`;

    setPreviewData({
      title: "Faculty Course Allocations & Syllabus Directory",
      fileName: "Faculty_Course_Allocations_Directory_2026.pdf",
      content: text,
    });
    setPreviewOpen(true);
  };

  const handleExportClassSyllabus = (cls: TeacherClassOverview) => {
    const text = `DELHI PUBLIC SCHOOL, R.K. PURAM
OFFICIAL COURSE SYLLABUS & SCHOLASTIC MILESTONES
Academic Session: 2024–2025 • Department of Mathematics

COURSE SPECIFICATIONS:
Course Title: ${cls.className}
Form / Grade: ${cls.form} (Grade Level: ${cls.gradeLevel})
Curriculum Code: ${cls.curriculumCode} • CBSE Affiliation No: 2730017
Lecture Hall: ${cls.roomNumber}
Enrolled Scholars: ${cls.enrolledCount} Scholars
Course Instructor: Dr. Alistair Finch (Senior Master)

PROGRESS & PERFORMANCE:
Syllabus Completion: ${cls.syllabusProgressPct}%
Cohort Average Score: ${cls.averageGrade}
Next Pending Milestone: ${cls.nextAssignment}
Due Date & Time: ${cls.nextDue}

CURRICULUM CHAPTER BREAKDOWN & WEIGHTAGE:
================================================================================
1. Relations and Functions & Inverse Trigonometry — 08 Marks (Completed)
2. Matrices and Determinants — 10 Marks (Completed)
3. Continuity, Differentiability & Derivatives Application — 35 Marks (Completed)
4. Vectors & Three-Dimensional Geometry — 14 Marks (In Progress - 94%)
5. Linear Programming — 05 Marks (Scheduled)
6. Probability & Bayes' Theorem — 08 Marks (Scheduled)
================================================================================

ASSESSMENT WEIGHTAGE DISTRIBUTION:
- Theory Board Examination Paper: 80 Marks
- Internal Assessment & Practical Record: 20 Marks
- Total Marks: 100 Marks (Passing Standard: 33%)

Verification Hash: CBSE-SYLLABUS-${cls.curriculumCode}-2026
Approved by Department Head: Dr. Alistair Finch`;

    setPreviewData({
      title: `${cls.form} Course Syllabus Breakdown`,
      fileName: `${cls.form.replace(/[^a-zA-Z0-9]/g, "_")}_Course_Syllabus.pdf`,
      content: text,
    });
    setPreviewOpen(true);
  };

  // Card themes configuration matching Image 2
  const cardThemes = [
    {
      id: "cls-01",
      tag: "Class 12-A (Science)",
      tagClass: "bg-[#E0F2FE] text-[#0369A1] dark:bg-blue-950/60 dark:text-blue-300",
      code: "CBSE_SCI",
      codeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
      name: "Class 12-A – Advanced Pure Mathematics & Physics",
      subTitle: "Physics • Higher Secondary",
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-300",
      icon: <FileText className="w-6 h-6" />,
      progressClass: "bg-[#10B981]",
      progressPct: 94,
      room: "Physics Wing Rm 301",
      enrolled: "38 Students",
      performance: "89.4%",
      performanceSub: "(CBSE Average)",
      nextAssignment: "Monday, 17:00 IST",
      assignBtnClass: "bg-[#0A369D] hover:bg-[#082975] text-white",
    },
    {
      id: "cls-02",
      tag: "Class 12-B (Commerce)",
      tagClass: "bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950/60 dark:text-amber-300",
      code: "CBSE_COMM",
      codeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
      name: "Class 12-B – Applied Mathematics for Commerce",
      subTitle: "Commerce • Higher Secondary",
      iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-300",
      icon: <BarChart3 className="w-6 h-6" />,
      progressClass: "bg-[#F59E0B]",
      progressPct: 91,
      room: "Commerce Wing Rm 204",
      enrolled: "36 Students",
      performance: "86.2%",
      performanceSub: "(CBSE Average)",
      nextAssignment: "Tuesday, 16:00 IST",
      assignBtnClass: "bg-[#9A3412] hover:bg-[#7C2D12] text-white",
    },
    {
      id: "cls-03",
      tag: "Class 11-A (Science)",
      tagClass: "bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-300",
      code: "CBSE_SCI",
      codeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      name: "Class 11-A – Calculus & Coordinate Geometry",
      subTitle: "Mathematics • Higher Secondary",
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300",
      icon: <span className="font-serif font-bold text-xl leading-none">√x</span>,
      progressClass: "bg-[#10B981]",
      progressPct: 82,
      room: "Chemistry Wing Rm 304",
      enrolled: "39 Students",
      performance: "84.8%",
      performanceSub: "(CBSE Average)",
      nextAssignment: "Wednesday, 18:00 IST",
      assignBtnClass: "bg-[#15803D] hover:bg-[#166534] text-white",
    },
    {
      id: "cls-04",
      tag: "Class 10-B (Secondary)",
      tagClass: "bg-[#FFE4E6] text-[#BE123C] dark:bg-rose-950/60 dark:text-rose-300",
      code: "CBSE_GEN",
      codeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
      name: "Class 10-B – Secondary Mathematics Foundation",
      subTitle: "Mathematics • Secondary",
      iconBg: "bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300",
      icon: <BookOpen className="w-6 h-6" />,
      progressClass: "bg-[#E11D48]",
      progressPct: 88,
      room: "Main Block Rm 102",
      enrolled: "40 Students",
      performance: "81.6%",
      performanceSub: "(CBSE Average)",
      nextAssignment: "Thursday, 14:00 IST",
      assignBtnClass: "bg-[#BE123C] hover:bg-[#9F1239] text-white",
    },
  ];

  return (
    <AppShell
      role="TEACHER"
      schoolName="The King's College & Academy"
      campusName="GENEVA CAMPUS"
      userName="Dr. Alistair Finch"
      userRoleTitle="Senior Master in Classical Humanities"
      epochText="Daily Schedule • Michaelmas Term 3 • Academic Year 2024–2025"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header Section matching Image 2 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                FACULTY COURSE ALLOCATIONS • 4 Active Form Courses
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0F172A] dark:text-stone-100">
              My Classes &amp; Academic Rosters
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#64748B] dark:text-stone-400 mt-1 max-w-2xl">
              Supervise course syllabus progression, student cohort performance, and launch direct attendance roll-calls or gradebook entries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Teach Inspire Graphic Badge */}
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-amber-200 dark:bg-amber-900/80 flex items-center justify-center text-amber-800 dark:text-amber-200 shrink-0">
                📚
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold text-amber-900 dark:text-amber-200">Teach Inspire</span>
                <span className="text-[9px] text-amber-700 dark:text-amber-300">Build Futures</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDirectory}
              className="text-xs gap-1.5 text-slate-700 hover:text-slate-900 shadow-xs"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              Directory (PDF)
            </Button>

            <Link href="/teacher/homework/new">
              <Button
                size="sm"
                className="bg-[#0A369D] hover:bg-[#082975] text-white text-xs font-semibold gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Assign New Homework
              </Button>
            </Link>
          </div>
        </div>

        {/* Pdf Preview Modal */}
        <PdfPreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title={previewData.title}
          fileName={previewData.fileName}
          content={previewData.content}
          studentMeta={{
            name: "Dr. Alistair Finch",
            rollNumber: "Staff ID: FAC-FINCH-104",
            form: "Department of Mathematics",
            house: "Senior Secondary Faculty Wing",
            institutionName: "DELHI PUBLIC SCHOOL, R.K. PURAM",
            institutionAffiliation: "Affiliated to Central Board of Secondary Education (CBSE) • Affiliation No: 2730017",
            institutionAddress: "Sector XII, R.K. Puram, New Delhi - 110022 • School Code: 85214",
            academicSession: "2024–2025",
          }}
        />

        {/* 4 Form Classes 2x2 Grid matching Image 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cardThemes.map((c) => (
            <Card
              key={c.id}
              className="p-6 rounded-2xl border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] shadow-xs flex flex-col justify-between space-y-5 hover:shadow-md transition-all"
            >
              <div className="space-y-4">
                {/* Header Row: Icon + Class Pill + CBSE Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${c.iconBg}`}>
                      {c.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${c.tagClass}`}>
                          {c.tag}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-stone-100 mt-1 leading-snug">
                        {c.name}
                      </h3>
                      <p className="font-sans text-xs text-slate-500 dark:text-stone-400 mt-0.5">
                        {c.subTitle}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border shrink-0 ${c.codeClass}`}>
                    {c.code}
                  </span>
                </div>

                {/* 3 Stats Columns Box */}
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-stone-900/40 border border-slate-200/60 dark:border-stone-800 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> Lecture Room
                    </span>
                    <div className="font-bold text-slate-800 dark:text-stone-200 mt-0.5 truncate">
                      {c.room}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" /> Scholars Enrolled
                    </span>
                    <div className="font-bold text-slate-800 dark:text-stone-200 mt-0.5">
                      {c.enrolled}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-slate-400" /> Cohort Performance
                    </span>
                    <div className="font-bold text-slate-800 dark:text-stone-200 mt-0.5">
                      {c.performance} <span className="text-[9px] font-normal text-slate-400">{c.performanceSub}</span>
                    </div>
                  </div>
                </div>

                {/* Syllabus Completion Progress Bar */}
                <div className="space-y-1.5 font-sans text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-stone-400 font-medium">Syllabus Completion</span>
                    <span className="font-bold text-slate-900 dark:text-stone-100">{c.progressPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${c.progressClass}`}
                      style={{ width: `${c.progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Next Assignment Badge */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-stone-900/50 border border-slate-200/60 dark:border-stone-800 text-xs text-slate-700 dark:text-stone-300">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-semibold text-slate-500">Next Assignment:</span>
                  <span className="font-bold text-slate-900 dark:text-stone-100">{c.nextAssignment}</span>
                </div>
              </div>

              {/* Action Buttons Row matching Image 2 */}
              <div className="pt-3 border-t border-slate-100 dark:border-stone-800 flex items-center justify-between gap-2">
                <Link href="/teacher/attendance" className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold text-[#0A369D] border-[#0A369D]/30 bg-[#F0F5FF] hover:bg-[#E5EFFF] gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Roll-Call
                  </Button>
                </Link>

                <Link href="/teacher/marks" className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold text-[#7E22CE] border-[#7E22CE]/30 bg-[#FAF5FF] hover:bg-[#F3E8FF] gap-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> Gradebook
                  </Button>
                </Link>

                <Link href="/teacher/homework/new" className="flex-1">
                  <Button
                    size="sm"
                    className={`w-full text-xs font-semibold gap-1.5 shadow-xs ${c.assignBtnClass}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Assign HW
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Motivational Quote Banner matching Image 2 */}
        <TeacherQuoteBanner
          icon={<GraduationCap className="w-6 h-6 text-white" />}
          iconBgClass="bg-[#0A369D] text-white"
          title="Great Teachers Make a Greater Tomorrow"
          subtitle="Your work today shapes brighter futures."
          quote="Education is the most powerful tool for change."
        />
      </div>
    </AppShell>
  );
}
