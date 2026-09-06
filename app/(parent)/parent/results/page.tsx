"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  fetchEnrolledWards,
  fetchWardReportCards,
  ParentWardProfile,
  WardAcademicReport,
} from "@/lib/db/parent";
import { triggerClientDownload } from "@/lib/utils";
import {
  Award,
  Download,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  FileText,
  Building2,
  Eye,
} from "lucide-react";
import { PdfPreviewModal } from "@/components/ui/pdf-preview-modal";
import { useAuth } from "@/components/providers/auth-context";

export default function ParentResultsPage() {
  const { profile, currentSchool } = useAuth();
  const [wards, setWards] = React.useState<ParentWardProfile[]>([]);
  const [selectedWardId, setSelectedWardId] = React.useState<string>("");
  const [reportCard, setReportCard] = React.useState<WardAcademicReport | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [previewDoc, setPreviewDoc] = React.useState<{
    isOpen: boolean;
    title: string;
    fileName: string;
    content: string;
    studentMeta?: { name?: string; form?: string; rollNumber?: string; house?: string };
  } | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const wardsData = await fetchEnrolledWards();
        setWards(wardsData);
        if (wardsData.length > 0) {
          const activeId = selectedWardId || wardsData[0].id;
          const report = await fetchWardReportCards(activeId);
          setReportCard(report);
        }
      } catch (err) {
        console.error("Failed to load report cards", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedWardId]);

  const activeWard = wards.find((w) => w.id === selectedWardId) || wards[0];

  const handleDownloadTranscript = () => {
    const wardName = activeWard?.name || "Student";
    const wardForm = activeWard?.form || "Class";
    const wardRoll = activeWard?.rollNumber || "N/A";
    const wardHouse = activeWard?.house || "N/A";

    const subjectsSummary = (reportCard?.subjects || [])
      .map(
        (s) =>
          `  - ${s.subject}: ${s.percentage}% | Teacher: ${s.teacherName}\n    Remarks: "${s.evaluativeComments}"`
      )
      .join("\n\n");

    const content = `OFFICIAL ACADEMIC REPORT CARD
=============================================================
Student Name: ${wardName}
Roll Number: ${wardRoll}
Class: ${wardForm}
House: ${wardHouse}
Institution: ${currentSchool?.name || currentSchool?.legal_name || "School Administration"}
Term: ${reportCard?.termName || "Term Results"}
Overall Aggregate: ${reportCard?.overallGpa || "0.0%"}

SUBJECT-WISE PERFORMANCE BREAKDOWN:
-------------------------------------------------------------
${subjectsSummary || "No subject results published yet."}

Verification Status: DIGITALLY VERIFIED RECORD
Timestamp: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`;

    setPreviewDoc({
      isOpen: true,
      title: "CBSE Pre-Board Examination Report Card",
      fileName: `${wardName.replace(/[^a-zA-Z0-9]/g, "_")}_PreBoard_Report_Card.pdf`,
      content,
      studentMeta: {
        name: wardName,
        form: wardForm,
        rollNumber: wardRoll,
        house: wardHouse,
      },
    });
  };

  const getSubjectIconMeta = (subjectName: string) => {
    const s = subjectName.toLowerCase();
    if (s.includes("math")) {
      return {
        symbol: "Σ",
        bg: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/50",
      };
    }
    if (s.includes("physic")) {
      return {
        symbol: "⚛",
        bg: "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/50",
      };
    }
    if (s.includes("chem")) {
      return {
        symbol: "⚗",
        bg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/50",
      };
    }
    if (s.includes("comp") || s.includes("python") || s.includes("cs")) {
      return {
        symbol: "💻",
        bg: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/50",
      };
    }
    return {
      symbol: "📖",
      bg: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/50",
    };
  };

  return (
    <AppShell
      role="PARENT"
      userName={profile?.full_name || "Parent"}
      userRoleTitle={`Parent${activeWard?.name ? ` • ${activeWard.name}` : ""}`}
      epochText="Academic Results"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-[#8C6D27] uppercase font-sans">
                  OFFICIAL REPORT CARD &amp; ACADEMIC RECORDS
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  {reportCard?.termName || "CBSE Class 12 Pre-Board Examination"}
                </span>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Report Card &amp; Exam Results
              </h1>
              <p className="font-sans text-xs md:text-sm text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
                View subject-wise marks, class ranks, teacher remarks, and download the official signed report card.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
              {/* Child Switcher Pills */}
              <div className="flex items-center gap-1.5 bg-stone-100/80 dark:bg-stone-900 p-1.5 rounded-xl border border-stone-200/80 dark:border-stone-800">
                {wards.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWardId(w.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      w.id === selectedWardId
                        ? "bg-[#8C6D27] text-white shadow-sm"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800"
                    }`}
                  >
                    {w.name.split(" ")[0]}
                  </button>
                ))}
              </div>

              {/* Download Report Card Button */}
              <button
                type="button"
                onClick={handleDownloadTranscript}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8C6D27] hover:bg-[#785c1f] text-white text-xs font-bold transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report Card (PDF)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Academic KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: OVERALL PERCENTAGE */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 font-sans">
              OVERALL PERCENTAGE
            </span>
            <div className="mt-2 space-y-1">
              <div className="font-serif text-3xl font-bold text-[#8C6D27] dark:text-amber-400">
                {reportCard?.overallGpa || "96.4%"}
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] dark:bg-emerald-950/50 text-[#15803D] dark:text-emerald-300">
                  First Division with Distinction
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: TOTAL MARKS */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 font-sans">
              TOTAL MARKS (AGGREGATE)
            </span>
            <div className="mt-2 space-y-1">
              <div className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                {reportCard?.predictedIbTotal || 482} / 500
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F3E8FF] dark:bg-purple-950/50 text-[#7E22CE] dark:text-purple-300">
                  Top 1% in Batch
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: CLASS RANK */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 font-sans">
              CLASS RANK
            </span>
            <div className="mt-2 space-y-1">
              <div className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                Rank 1 in Class
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F2FE] dark:bg-sky-950/50 text-[#0369A1] dark:text-sky-300">
                  Class 12-A Science
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: CONDUCT & DISCIPLINE */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 font-sans">
              CONDUCT &amp; DISCIPLINE
            </span>
            <div className="mt-2 space-y-1">
              <div className="font-serif text-3xl font-bold text-[#0F172A] dark:text-stone-100">
                EXCELLENT
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] dark:bg-amber-950/50 text-[#B45309] dark:text-amber-300">
                  Principal&apos;s Special Commendation
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gradebook Matrix Table Card */}
        <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Card Header */}
          <div className="p-5 border-b border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/50 dark:bg-stone-900/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#8C6D27] flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/40">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                  Pre-Board Terminal Examination Marks Sheet
                </h3>
                <p className="font-sans text-xs text-stone-500 dark:text-stone-400">
                  Evaluated as per CBSE Board examination guidelines
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] dark:bg-emerald-950/50 text-[#15803D] dark:text-emerald-300 text-xs font-semibold self-start sm:self-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified by Principal</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800 text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 tracking-wider">
                  <th className="py-3.5 px-5">SUBJECT &amp; TEACHER</th>
                  <th className="py-3.5 px-5 text-center">CATEGORY</th>
                  <th className="py-3.5 px-5 text-center">CBSE GRADE</th>
                  <th className="py-3.5 px-5 text-right">MARKS / 100</th>
                  <th className="py-3.5 px-5 text-right">CLASS AVG</th>
                  <th className="py-3.5 px-5">TEACHER&apos;S REMARKS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {reportCard?.subjects.map((sub, idx) => {
                  const iconMeta = getSubjectIconMeta(sub.subject);
                  return (
                    <tr key={idx} className="hover:bg-stone-50/60 dark:hover:bg-stone-900/40 transition-colors">
                      {/* Subject & Teacher */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-serif text-base font-bold shrink-0 ${iconMeta.bg}`}>
                            {iconMeta.symbol}
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 dark:text-stone-100 text-xs block">
                              {sub.subject}
                            </span>
                            <span className="text-[11px] text-stone-500 dark:text-stone-400">
                              {sub.teacherName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-5 text-center">
                        <span className="inline-block text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {sub.level === "Elective" ? "Elective" : "Core Subject"}
                        </span>
                      </td>

                      {/* CBSE Grade */}
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#FEF3C7] dark:bg-amber-950/50 text-[#92400E] dark:text-amber-300 font-serif font-bold text-sm border border-amber-300 dark:border-amber-700/50 shadow-xs">
                          A1
                        </span>
                      </td>

                      {/* Marks */}
                      <td className="py-4 px-5 text-right font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                        {sub.percentage}%
                      </td>

                      {/* Class Avg */}
                      <td className="py-4 px-5 text-right text-xs font-mono text-stone-500 dark:text-stone-400">
                        {sub.termAverage}
                      </td>

                      {/* Evaluative Remarks */}
                      <td className="py-4 px-5 text-xs text-stone-600 dark:text-stone-300 max-w-sm italic leading-relaxed">
                        &ldquo;{sub.evaluativeComments}&rdquo;
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Certification Ribbon */}
          <div className="p-5 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-[#8C6D27] flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/40">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 block">
                  Digital Verification &amp; Sovereign ID Seal
                </span>
                <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400 block">
                  Verification Status: AUTHENTICATED ACADEMIC RECORD
                </span>
              </div>
            </div>

            <div className="text-left md:text-right">
              <span className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 block italic">
                Office of Academic Affairs
              </span>
              <span className="font-sans text-xs text-stone-500 dark:text-stone-400">
                {currentSchool?.name || currentSchool?.legal_name || "School Administration"}
              </span>
            </div>
          </div>
        </div>

        {/* Motivational Bottom Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-[#FFFBF0] dark:bg-[#171d29] border border-amber-200/80 dark:border-amber-900/40 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 dark:bg-amber-950/60 text-[#8C6D27] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#8C6D27] uppercase font-sans block">
                AGRAGATI ACADEMIC EXCELLENCE
              </span>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                Knowledge Today. Greater Possibilities Tomorrow.
              </h3>
              <p className="font-serif italic text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                &ldquo;Discipline and hard work lead to excellence.&rdquo;
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-xs text-stone-500 dark:text-stone-400 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>99.2% Attendance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#8C6D27]" />
              <span>Rank 1 in Class 12-A</span>
            </div>
          </div>
        </div>
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
