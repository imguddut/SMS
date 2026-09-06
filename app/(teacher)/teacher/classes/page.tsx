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
import { useAuth } from "@/components/providers/auth-context";

export default function TeacherClassesPage() {
  const { profile, school } = useAuth();
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

  const teacherName = profile?.full_name || "Faculty Member";
  const teacherDesignation = profile?.role || "Faculty";
  const schoolDisplayName = school?.name || "School Portal";

  const handleExportDirectory = () => {
    const text = `${schoolDisplayName.toUpperCase()}
OFFICIAL FACULTY COURSE ALLOCATIONS & SYLLABUS DIRECTORY
Generated: ${new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

FACULTY MASTER RECORD:
Faculty Member: ${teacherName}
Designation: ${teacherDesignation}
Total Courses Assigned: ${classes.length} Form Courses
Staff ID: ${profile?.id || "N/A"}

ALLOCATED COURSES & ACADEMIC STATUS:
================================================================================
${classes.length > 0 ? classes.map((c, idx) => `${idx + 1}. COURSE: ${c.className}
   Curriculum Code: ${c.curriculumCode || "N/A"} • Room: ${c.roomNumber || "Unassigned"}
   Registered Scholars: ${c.enrolledCount} Scholars
   Syllabus Completion: ${c.syllabusProgressPct}%
   Cohort Performance: ${c.averageGrade}
   Next Milestone: ${c.nextAssignment}`).join("\n\n") : "No courses currently allocated."}
================================================================================

Official Faculty Signature: ${teacherName}`;

    setPreviewData({
      title: "Faculty Course Allocations & Syllabus Directory",
      fileName: `Faculty_Course_Directory_${teacherName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      content: text,
    });
    setPreviewOpen(true);
  };

  const handleExportClassSyllabus = (cls: TeacherClassOverview) => {
    const text = `${schoolDisplayName.toUpperCase()}
OFFICIAL COURSE SYLLABUS & SCHOLASTIC MILESTONES
Generated: ${new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

COURSE SPECIFICATIONS:
Course Title: ${cls.className}
Form / Grade: ${cls.form} (Grade Level: ${cls.gradeLevel})
Curriculum Code: ${cls.curriculumCode || "Standard"}
Lecture Hall: ${cls.roomNumber || "Unassigned"}
Enrolled Scholars: ${cls.enrolledCount} Scholars
Course Instructor: ${teacherName}

PROGRESS & PERFORMANCE:
Syllabus Completion: ${cls.syllabusProgressPct}%
Cohort Average Score: ${cls.averageGrade}
Next Pending Milestone: ${cls.nextAssignment}
Due Date & Time: ${cls.nextDue}

ASSESSMENT WEIGHTAGE DISTRIBUTION:
- Theory Examination Paper: 80 Marks
- Internal Assessment & Practical Record: 20 Marks
- Total Marks: 100 Marks (Passing Standard: 33%)

Approved by Faculty: ${teacherName}`;

    setPreviewData({
      title: `${cls.form || cls.className} Course Syllabus Breakdown`,
      fileName: `${(cls.form || cls.className).replace(/[^a-zA-Z0-9]/g, "_")}_Course_Syllabus.pdf`,
      content: text,
    });
    setPreviewOpen(true);
  };


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
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                FACULTY COURSE ALLOCATIONS • {classes.length} Active Form Courses
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
            name: teacherName,
            rollNumber: `Staff ID: ${profile?.id || "N/A"}`,
            form: teacherDesignation,
            house: school?.name || "Faculty Wing",
            institutionName: schoolDisplayName,
            institutionAffiliation: school?.code || "",
            institutionAddress: "",
            academicSession: new Date().getFullYear().toString(),
          }}
        />

        {/* Form Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-stone-800 bg-white dark:bg-[#12161f] text-slate-500">
              <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-stone-200">No Classes Assigned</h3>
              <p className="text-xs text-slate-500 dark:text-stone-400 mt-1">There are currently no classes or sections assigned to your faculty profile.</p>
            </div>
          ) : (
            classes.map((c, idx) => {
              const themeColors = [
                {
                  tagClass: "bg-[#E0F2FE] text-[#0369A1] dark:bg-blue-950/60 dark:text-blue-300",
                  codeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
                  iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-300",
                  progressClass: "bg-[#10B981]",
                  assignBtnClass: "bg-[#0A369D] hover:bg-[#082975] text-white",
                },
                {
                  tagClass: "bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950/60 dark:text-amber-300",
                  codeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
                  iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-300",
                  progressClass: "bg-[#F59E0B]",
                  assignBtnClass: "bg-[#9A3412] hover:bg-[#7C2D12] text-white",
                },
                {
                  tagClass: "bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-300",
                  codeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
                  iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300",
                  progressClass: "bg-[#10B981]",
                  assignBtnClass: "bg-[#15803D] hover:bg-[#166534] text-white",
                },
                {
                  tagClass: "bg-[#FFE4E6] text-[#BE123C] dark:bg-rose-950/60 dark:text-rose-300",
                  codeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
                  iconBg: "bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300",
                  progressClass: "bg-[#E11D48]",
                  assignBtnClass: "bg-[#BE123C] hover:bg-[#9F1239] text-white",
                },
              ];
              const theme = themeColors[idx % themeColors.length];

              return (
                <Card
                  key={c.id || idx}
                  className="p-6 rounded-2xl border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] shadow-xs flex flex-col justify-between space-y-5 hover:shadow-md transition-all"
                >
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${theme.iconBg}`}>
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${theme.tagClass}`}>
                              {c.form || c.className}
                            </span>
                          </div>
                          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-stone-100 mt-1 leading-snug">
                            {c.className}
                          </h3>
                          <p className="font-sans text-xs text-slate-500 dark:text-stone-400 mt-0.5">
                            Grade Level: {c.gradeLevel} • {c.form || "General"}
                          </p>
                        </div>
                      </div>

                      {c.curriculumCode && (
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border shrink-0 ${theme.codeClass}`}>
                          {c.curriculumCode}
                        </span>
                      )}
                    </div>

                    {/* 3 Stats Columns Box */}
                    <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-stone-900/40 border border-slate-200/60 dark:border-stone-800 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> Room
                        </span>
                        <div className="font-bold text-slate-800 dark:text-stone-200 mt-0.5 truncate">
                          {c.roomNumber || "Unassigned"}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" /> Enrolled
                        </span>
                        <div className="font-bold text-slate-800 dark:text-stone-200 mt-0.5">
                          {c.enrolledCount}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-slate-400" /> Average
                        </span>
                        <div className="font-bold text-slate-800 dark:text-stone-200 mt-0.5">
                          {c.averageGrade}
                        </div>
                      </div>
                    </div>

                    {/* Syllabus Completion Progress Bar */}
                    <div className="space-y-1.5 font-sans text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-stone-400 font-medium">Syllabus Completion</span>
                        <span className="font-bold text-slate-900 dark:text-stone-100">{c.syllabusProgressPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${theme.progressClass}`}
                          style={{ width: `${c.syllabusProgressPct}%` }}
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

                  {/* Action Buttons Row */}
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
                        className={`w-full text-xs font-semibold gap-1.5 shadow-xs ${theme.assignBtnClass}`}
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Assign HW
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Motivational Quote Banner */}
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
