"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Modal } from "@/components/ui/modal";
import { triggerClientDownload } from "@/lib/utils";
import {
  fetchStudentResults,
  fetchStudentProfile,
  StudentResultMatrix,
  StudentSubjectScore,
  StudentProfile,
} from "@/lib/db/student";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  BookOpen,
  GraduationCap,
  Users,
  Globe,
  BarChart3,
  FileSpreadsheet,
  Atom,
  FlaskConical,
  Laptop,
  Trophy,
  Download,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
} from "lucide-react";
import { PdfPreviewModal } from "@/components/ui/pdf-preview-modal";
import { useAuth } from "@/components/providers/auth-context";

export default function StudentResultsPage() {
  const { profile, school } = useAuth();
  const [studentProfile, setStudentProfile] = React.useState<StudentProfile | null>(null);
  const [results, setResults] = React.useState<StudentResultMatrix | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDetailedModalOpen, setIsDetailedModalOpen] = React.useState(false);
  const [selectedSubject, setSelectedSubject] = React.useState<StudentSubjectScore | null>(null);
  const [alertMessage, setAlertMessage] = React.useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = React.useState<{
    isOpen: boolean;
    title: string;
    fileName: string;
    content: string;
    studentMeta?: { name?: string; form?: string; rollNumber?: string; house?: string };
  } | null>(null);

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 3500);
  };

  React.useEffect(() => {
    async function loadData() {
      try {
        const [data, sProfile] = await Promise.all([
          fetchStudentResults(),
          fetchStudentProfile(),
        ]);
        setResults(data);
        setStudentProfile(sProfile);
      } catch (err) {
        console.error("Failed to load results", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDownloadTranscript = () => {
    if (!results) return;

    const subjectsSummary = results.subjects
      .map(
        (s) =>
          `  - ${s.subject}: ${s.grade}/100 (${s.percentage}%) | Class Rank: ${s.classRank} | Teacher: ${s.teacherName}\n    Evaluation: "${s.evaluativeComments}"`
      )
      .join("\n\n");

    const studentName = profile?.full_name || studentProfile?.name || "Student";
    const content = `${(school?.name || "AGRAGATI ACADEMY").toUpperCase()} - OFFICIAL REPORT CARD
=============================================================
Student Name: ${studentName}
Roll Number: ${studentProfile?.rollNumber || "N/A"}
Class: ${studentProfile?.form || "N/A"}
House: ${studentProfile?.house || "N/A"}
Academic Term: ${results.termName} (${results.academicYear})
Overall Aggregate GPA: ${results.overallGpa}
Cohort Standing: ${results.cohortRank || "N/A"}
Conduct & Diligence: ${results.conductRating}

SUBJECT-WISE PERFORMANCE BREAKDOWN:
-------------------------------------------------------------
${subjectsSummary || "No subject marks recorded."}

Timestamp: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
Sealed by Examination Directorate`;

    setPreviewDoc({
      isOpen: true,
      title: "Academic Transcript & Report Card",
      fileName: `${studentName.replace(/\s+/g, "_")}_Transcript.pdf`,
      content,
      studentMeta: {
        name: studentName,
        form: studentProfile?.form || "",
        rollNumber: studentProfile?.rollNumber || "",
        house: studentProfile?.house || "",
      },
    });
  };

  const handleDownloadSubjectReport = (subject: StudentSubjectScore) => {
    const studentName = profile?.full_name || studentProfile?.name || "Student";
    const safeName = subject.subject.replace(/[^a-zA-Z0-9]/g, "_");
    const content = `${(school?.name || "AGRAGATI ACADEMY").toUpperCase()} - SUBJECT MASTERY & SYLLABUS AUDIT
Subject: ${subject.subject}
Instructor: ${subject.teacherName || "Faculty"}
Student: ${studentName} (${studentProfile?.form || ""})
Score: ${subject.grade} / 100 (${subject.percentage}%)
Class Cohort Rank: ${subject.classRank || "N/A"}
Term Average: ${subject.termAverage}
Syllabus Mastery Index: ${subject.masteryRadar}%

FACULTY COMMENTS:
"${subject.evaluativeComments || "Completed."}"`;

    setPreviewDoc({
      isOpen: true,
      title: `Subject Mastery Report • ${subject.subject}`,
      fileName: `${safeName}_Mastery_Report.pdf`,
      content,
      studentMeta: {
        name: studentName,
        form: studentProfile?.form || "",
        rollNumber: studentProfile?.rollNumber || "",
        house: studentProfile?.house || "",
      },
    });
  };

  return (
    <AppShell
      role="STUDENT"
      userName={profile?.full_name || studentProfile?.name || "Student"}
      userRoleTitle={studentProfile?.form ? `SCHOLAR • ${studentProfile.form.toUpperCase()}` : "STUDENT"}
      epochText="Terminal Examination Matrix"
    >
      <div className="space-y-6">
        {/* Toast Alert Feedback */}
        {alertMessage && (
          <div className="fixed top-5 right-5 z-50 bg-stone-900/95 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-500/40 animate-in fade-in slide-in-from-top-4 duration-200">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-sans text-xs font-semibold">{alertMessage}</span>
          </div>
        )}

        {/* Header with Quote Box & Download Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                ACADEMIC PERFORMANCE &amp; CBSE DIPLOMA MATRIX
              </span>
              <span className="text-stone-300 text-xs">•</span>
              <span className="font-sans text-[10px] font-medium text-stone-500">
                {results?.termName || "CBSE Class 12 Pre-Board Examination"}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-stone-900">
              Examination Results &amp; Mastery Radar
            </h1>
            <p className="font-sans text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Terminal examination grades, predicted aggregate standing, and individual subject syllabus mastery index.
            </p>
          </div>

          {/* Right Action & Quote Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={handleDownloadTranscript}
              className="px-4 py-3 rounded-2xl bg-[#8B5E34] hover:bg-[#784f2c] text-white font-sans text-xs font-bold flex items-center gap-2 shadow-xs transition-all shrink-0"
            >
              <Download className="w-4 h-4 text-amber-200" />
              <span>Download Report Card (PDF)</span>
            </button>

            <div className="bg-[#FFFDF9] border border-amber-200/70 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs shrink-0">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="font-serif italic text-xs text-stone-700 leading-snug">
                  &ldquo;Excellence is a habit, not a result.&rdquo;
                </p>
                <span className="text-[10px] text-stone-400 font-sans block mt-0.5">
                  — Agragati Academy Honor Roll
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Academic KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Overall Term GPA */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-stone-500">
                OVERALL TERM GPA
              </span>
            </div>
            <div className="font-serif text-3xl font-bold text-stone-900 mt-2">
              96.4%
            </div>
            <span className="font-sans text-xs text-stone-500 mt-0.5">
              (Aggregate Score)
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 mt-3 pt-2 border-t border-stone-100 font-sans">
              <Trophy className="w-3.5 h-3.5 fill-amber-600 text-amber-700" />
              <span>High Honors Standing</span>
            </div>
          </div>

          {/* Card 2: Predicted Board Total */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-stone-500">
                PREDICTED BOARD TOTAL
              </span>
            </div>
            <div className="font-serif text-3xl font-bold text-stone-900 mt-2">
              482 / 500 Pts
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 mt-3 pt-2 border-t border-stone-100 font-sans">
              <Globe className="w-3.5 h-3.5 text-stone-400" />
              <span>Top 1% Nationwide Quintile</span>
            </div>
          </div>

          {/* Card 3: Cohort Standing */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-stone-500">
                COHORT STANDING
              </span>
            </div>
            <div className="font-serif text-3xl font-bold text-stone-900 mt-2">
              1st in Class 12
            </div>
            <div className="text-xs text-stone-500 mt-3 pt-2 border-t border-stone-100 font-sans">
              320 Enrolled Scholars
            </div>
          </div>

          {/* Card 4: Conduct & Diligence */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-stone-500">
                CONDUCT &amp; DILIGENCE
              </span>
            </div>
            <div className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mt-2 tracking-tight">
              EXEMPLARY
            </div>
            <div className="text-xs text-stone-500 mt-3 pt-2 border-t border-stone-100 font-sans">
              Principal&apos;s Commendation
            </div>
          </div>
        </div>

        {/* Subject Breakdown & Mastery Radar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-lg md:text-xl font-bold text-stone-900">
                Subject Gradebook &amp; Syllabus Mastery Radar
              </h2>
            </div>
            <button
              onClick={() => setIsDetailedModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200/80 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs flex items-center gap-1.5 font-sans transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-stone-500" />
              <span>View Detailed Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Mathematics (041) */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-serif font-bold text-lg shrink-0 border border-indigo-100">
                    Σ
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-sans mb-0.5">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase">
                        CORE
                      </span>
                      <span className="text-xs text-stone-500">Prof. Rajesh Verma</span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      Mathematics (041)
                    </h3>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-serif text-3xl font-bold text-stone-900 leading-none">
                    98
                  </div>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block mt-1">
                    Grade A1
                  </span>
                </div>
              </div>

              {/* Progress Mastery Bar */}
              <div className="space-y-1.5 font-sans pt-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-stone-500">Syllabus Mastery Index</span>
                  <span className="font-bold text-stone-800">98% (98% Exam Score)</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#1E3A8A] h-full rounded-full transition-all duration-500" style={{ width: "98%" }} />
                </div>
              </div>

              <p className="font-serif italic text-xs text-stone-600 pt-2 border-t border-stone-100">
                &ldquo;Exceptional mathematical rigour and speed in calculus and 3D geometry.&rdquo;
              </p>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() =>
                    handleDownloadSubjectReport({
                      subject: "Mathematics (041)",
                      level: "Core",
                      grade: 98,
                      percentage: 98.0,
                      termAverage: "88.2%",
                      classRank: "1st in Cohort",
                      teacherName: "Prof. Rajesh Verma",
                      masteryRadar: 98,
                      evaluativeComments: "Exceptional mathematical rigour and speed in calculus and 3D geometry.",
                    })
                  }
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 font-sans"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Subject Audit (PDF)</span>
                </button>
              </div>
            </div>

            {/* 2. Physics (042) */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-lg shrink-0 border border-rose-100">
                    <Atom className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-sans mb-0.5">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase">
                        CORE
                      </span>
                      <span className="text-xs text-stone-500">Mrs. Sunita Deshmukh</span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      Physics (042)
                    </h3>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-serif text-3xl font-bold text-stone-900 leading-none">
                    96
                  </div>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block mt-1">
                    Grade A1
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 font-sans pt-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-stone-500">Syllabus Mastery Index</span>
                  <span className="font-bold text-stone-800">96% (96% Exam Score)</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#1E3A8A] h-full rounded-full transition-all duration-500" style={{ width: "96%" }} />
                </div>
              </div>

              <p className="font-serif italic text-xs text-stone-600 pt-2 border-t border-stone-100">
                &ldquo;Demonstrates deep conceptual mastery of electromagnetic waves and optics.&rdquo;
              </p>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() =>
                    handleDownloadSubjectReport({
                      subject: "Physics (042)",
                      level: "Core",
                      grade: 96,
                      percentage: 96.0,
                      termAverage: "84.1%",
                      classRank: "1st in Cohort",
                      teacherName: "Mrs. Sunita Deshmukh",
                      masteryRadar: 96,
                      evaluativeComments: "Demonstrates deep conceptual mastery of electromagnetic waves and optics.",
                    })
                  }
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 font-sans"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Subject Audit (PDF)</span>
                </button>
              </div>
            </div>

            {/* 3. Chemistry (043) */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0 border border-emerald-100">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-sans mb-0.5">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase">
                        CORE
                      </span>
                      <span className="text-xs text-stone-500">Dr. Arvind Swaminathan</span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      Chemistry (043)
                    </h3>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-serif text-3xl font-bold text-stone-900 leading-none">
                    94
                  </div>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block mt-1">
                    Grade A1
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 font-sans pt-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-stone-500">Syllabus Mastery Index</span>
                  <span className="font-bold text-stone-800">94% (94% Exam Score)</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#1E3A8A] h-full rounded-full transition-all duration-500" style={{ width: "94%" }} />
                </div>
              </div>

              <p className="font-serif italic text-xs text-stone-600 pt-2 border-t border-stone-100">
                &ldquo;Strong grasp of organic reaction mechanisms and chemical kinetics.&rdquo;
              </p>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() =>
                    handleDownloadSubjectReport({
                      subject: "Chemistry (043)",
                      level: "Core",
                      grade: 94,
                      percentage: 94.0,
                      termAverage: "85.0%",
                      classRank: "2nd in Cohort",
                      teacherName: "Dr. Arvind Swaminathan",
                      masteryRadar: 94,
                      evaluativeComments: "Strong grasp of organic reaction mechanisms and chemical kinetics.",
                    })
                  }
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 font-sans"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Subject Audit (PDF)</span>
                </button>
              </div>
            </div>

            {/* 4. Computer Science (083) */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-lg shrink-0 border border-sky-100">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-sans mb-0.5">
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold uppercase">
                        ELECTIVE
                      </span>
                      <span className="text-xs text-stone-500">Mr. Anand Sen</span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      Computer Science (083)
                    </h3>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-serif text-3xl font-bold text-stone-900 leading-none">
                    99
                  </div>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block mt-1">
                    Grade A1
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 font-sans pt-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-stone-500">Syllabus Mastery Index</span>
                  <span className="font-bold text-stone-800">99% (99% Exam Score)</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#1E3A8A] h-full rounded-full transition-all duration-500" style={{ width: "99%" }} />
                </div>
              </div>

              <p className="font-serif italic text-xs text-stone-600 pt-2 border-t border-stone-100">
                &ldquo;Outstanding programming logic, data structures, and SQL optimization.&rdquo;
              </p>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() =>
                    handleDownloadSubjectReport({
                      subject: "Computer Science (083)",
                      level: "Elective",
                      grade: 99,
                      percentage: 99.0,
                      termAverage: "89.5%",
                      classRank: "1st in Cohort",
                      teacherName: "Mr. Anand Sen",
                      masteryRadar: 99,
                      evaluativeComments: "Outstanding programming logic, data structures, and SQL optimization.",
                    })
                  }
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 font-sans"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Subject Audit (PDF)</span>
                </button>
              </div>
            </div>

            {/* 5. English Core (301) */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-lg shrink-0 border border-rose-100">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-sans mb-0.5">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase">
                        CORE
                      </span>
                      <span className="text-xs text-stone-500">Mrs. Priya Nair</span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      English Core (301)
                    </h3>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-serif text-3xl font-bold text-stone-900 leading-none">
                    95
                  </div>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block mt-1">
                    Grade A1
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 font-sans pt-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-stone-500">Syllabus Mastery Index</span>
                  <span className="font-bold text-stone-800">95% (95% Exam Score)</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#1E3A8A] h-full rounded-full transition-all duration-500" style={{ width: "95%" }} />
                </div>
              </div>

              <p className="font-serif italic text-xs text-stone-600 pt-2 border-t border-stone-100">
                &ldquo;Sophisticated critical synthesis and creative expression in literature.&rdquo;
              </p>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() =>
                    handleDownloadSubjectReport({
                      subject: "English Core (301)",
                      level: "Core",
                      grade: 95,
                      percentage: 95.0,
                      termAverage: "86.0%",
                      classRank: "1st in Cohort",
                      teacherName: "Mrs. Priya Nair",
                      masteryRadar: 95,
                      evaluativeComments: "Sophisticated critical synthesis and creative expression in literature.",
                    })
                  }
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 font-sans"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Subject Audit (PDF)</span>
                </button>
              </div>
            </div>

            {/* 6. Motivation Card with Laurel Trophy & Academy Sketch */}
            <div className="bg-[#FFFDF9] border border-amber-200/70 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden flex items-center gap-5">
              <div className="absolute right-0 -bottom-2 pointer-events-none opacity-20 hidden sm:block">
                <svg className="w-36 h-28 text-amber-900" viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="0.8">
                  <polygon points="60,10 50,40 70,40" />
                  <rect x="52" y="40" width="16" height="40" />
                  <line x1="20" y1="80" x2="100" y2="80" />
                </svg>
              </div>

              <div className="relative z-10 w-16 h-16 rounded-full bg-amber-100/70 border border-amber-200 flex items-center justify-center shrink-0">
                <Trophy className="w-8 h-8 fill-amber-500 text-amber-700" />
              </div>

              <div className="relative z-10">
                <p className="font-serif italic text-base md:text-lg font-bold text-stone-800 leading-snug">
                  Your hard work <br />shapes a brighter tomorrow.
                </p>
                <div className="w-12 h-1 bg-amber-400 rounded-full mt-2.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Principal Institutional Certification Ribbon */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 md:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-base font-bold text-stone-900 block">
                Principal Sovereign Certification &amp; Board Verification
              </span>
              <span className="font-mono text-xs text-stone-500 block mt-0.5">
                Hash: {results?.proviseurSeal || "SEAL-PRINCIPAL-APAAR-998418-CBSE"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end md:self-center">
            <button
              onClick={handleDownloadTranscript}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors font-sans"
            >
              <Download className="w-3.5 h-3.5 text-amber-800" />
              <span>Download Sealed Marksheet</span>
            </button>

            {/* Digital Signature SVG Graphic */}
            <div className="w-24 h-10 flex items-center justify-center">
              <svg className="w-24 h-10 text-indigo-900" viewBox="0 0 120 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 28 C15 10, 20 8, 25 32 C30 5, 35 15, 45 22 C55 28, 65 12, 75 18 C85 24, 95 15, 110 25" />
                <path d="M35 25 L85 10" strokeWidth="1.2" />
              </svg>
            </div>

            <div className="text-right font-sans">
              <span className="font-serif font-bold text-xs text-stone-900 block">
                Dr. V. K. Malhotra
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                Principal &amp; Headmaster • Agragati Academy
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Performance Modal */}
        <Modal
          isOpen={isDetailedModalOpen}
          onClose={() => setIsDetailedModalOpen(false)}
          title={results?.termName ? `${results.termName} Comprehensive Evaluation Report` : "Terminal Evaluation Report"}
          description="Detailed breakdown of theoretical examinations, practical labs, and cohort percentiles."
          maxWidth="2xl"
        >
          <div className="space-y-6 font-sans text-xs">
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/70 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-bold text-stone-900 text-sm font-serif block">{profile?.full_name || studentProfile?.name || "Student"}</span>
                <span className="text-stone-500 text-[11px]">{studentProfile?.form || "Student"} {studentProfile?.rollNumber ? `• Roll: ${studentProfile.rollNumber}` : ""} {studentProfile?.house ? `• ${studentProfile.house}` : ""}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Aggregate Score</span>
                <span className="font-serif text-2xl font-bold text-amber-900">{results?.overallGpa || "0.0%"}</span>
              </div>
            </div>

            {/* Subject Table */}
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                    <th className="p-3 font-semibold">Subject &amp; Code</th>
                    <th className="p-3 font-semibold text-center">Theory (70/80)</th>
                    <th className="p-3 font-semibold text-center">Practical (30/20)</th>
                    <th className="p-3 font-semibold text-center">Total (100)</th>
                    <th className="p-3 font-semibold text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr className="hover:bg-stone-50">
                    <td className="p-3 font-medium text-stone-900">Mathematics (041)</td>
                    <td className="p-3 text-center text-stone-600">78 / 80</td>
                    <td className="p-3 text-center text-stone-600">20 / 20</td>
                    <td className="p-3 text-center font-bold text-stone-900">98</td>
                    <td className="p-3 text-center font-bold text-emerald-700">A1</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-3 font-medium text-stone-900">Physics (042)</td>
                    <td className="p-3 text-center text-stone-600">67 / 70</td>
                    <td className="p-3 text-center text-stone-600">29 / 30</td>
                    <td className="p-3 text-center font-bold text-stone-900">96</td>
                    <td className="p-3 text-center font-bold text-emerald-700">A1</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-3 font-medium text-stone-900">Chemistry (043)</td>
                    <td className="p-3 text-center text-stone-600">65 / 70</td>
                    <td className="p-3 text-center text-stone-600">29 / 30</td>
                    <td className="p-3 text-center font-bold text-stone-900">94</td>
                    <td className="p-3 text-center font-bold text-emerald-700">A1</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-3 font-medium text-stone-900">Computer Science (083)</td>
                    <td className="p-3 text-center text-stone-600">69 / 70</td>
                    <td className="p-3 text-center text-stone-600">30 / 30</td>
                    <td className="p-3 text-center font-bold text-stone-900">99</td>
                    <td className="p-3 text-center font-bold text-emerald-700">A1</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-3 font-medium text-stone-900">English Core (301)</td>
                    <td className="p-3 text-center text-stone-600">76 / 80</td>
                    <td className="p-3 text-center text-stone-600">19 / 20</td>
                    <td className="p-3 text-center font-bold text-stone-900">95</td>
                    <td className="p-3 text-center font-bold text-emerald-700">A1</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-stone-500 font-mono">
                CBSE Examination ID: 12104928 • APAAR ID: 998418-2024
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTranscript}
                  className="px-4 py-2 rounded-xl bg-[#8B5E34] hover:bg-[#784f2c] text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-amber-200" />
                  <span>Download Marksheet (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDetailedModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      {previewDoc && (
        <PdfPreviewModal
          isOpen={previewDoc.isOpen}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.title}
          fileName={previewDoc.fileName}
          content={previewDoc.content}
          studentMeta={previewDoc.studentMeta}
        />
      )}
    </AppShell>
  );
}
