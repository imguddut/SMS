"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileCheck2,
  FileText,
  Clock,
  Send,
  Check,
  Calendar,
  ExternalLink,
  ChevronDown,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  fetchHomeworkSubmissions,
  gradeSubmission,
  StudentHomeworkSubmission,
} from "@/lib/db/teacher";
import { PdfPreviewModal } from "@/components/ui/pdf-preview-modal";
import { TeacherQuoteBanner } from "@/components/ui/teacher-quote-banner";
import { useAuth } from "@/components/providers/auth-context";

export default function TeacherHomeworkReviewPage() {
  const { profile, currentSchool } = useAuth();
  const [submissions, setSubmissions] = React.useState<StudentHomeworkSubmission[]>([]);
  const [grades, setGrades] = React.useState<Record<string, { marks: number; feedback: string }>>({});
  const [savedGrades, setSavedGrades] = React.useState<Record<string, { saved: boolean; date?: string }>>({});
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"ALL" | "PENDING" | "GRADED" | "LATE">("ALL");
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<{
    title: string;
    fileName: string;
    content: string;
    studentName: string;
    studentId: string;
    form: string;
  }>({
    title: "",
    fileName: "",
    content: "",
    studentName: "",
    studentId: "",
    form: "",
  });

  React.useEffect(() => {
    async function load() {
      try {
        const data = await fetchHomeworkSubmissions();
        setSubmissions(data || []);

        const initialGrades: Record<string, { marks: number; feedback: string }> = {};
        const initialSaved: Record<string, { saved: boolean; date?: string }> = {};
        (data || []).forEach((sub) => {
          initialGrades[sub.id] = {
            marks: sub.marksAwarded ?? sub.maxMarks,
            feedback: sub.feedback || "",
          };
          if (sub.status === "GRADED") {
            initialSaved[sub.id] = { saved: true, date: sub.submittedAt };
          }
        });
        setGrades(initialGrades);
        setSavedGrades(initialSaved);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleGradeChange = (id: string, field: "marks" | "feedback", val: any) => {
    setGrades((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: val,
      },
    }));
  };

  const handlePublishGrade = async (sub: StudentHomeworkSubmission) => {
    const current = grades[sub.id];
    await gradeSubmission(sub.id, current?.marks || 45, current?.feedback || "");
    const todayStr = new Date().toISOString().split("T")[0];
    setSavedGrades((prev) => ({
      ...prev,
      [sub.id]: { saved: true, date: todayStr },
    }));
  };

  const handleExportEvaluationReport = () => {
    const schoolName = currentSchool?.name || currentSchool?.legal_name || "School Administration";
    const text = `${schoolName}
OFFICIAL HOMEWORK EVALUATION & SUBMISSIONS REPORT

ASSIGNMENT DETAILS:
Assignment: Homework Review Report
Evaluator: ${profile?.full_name || "Faculty Evaluator"}
Report Date: ${new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

SUMMARY EVALUATION METRICS:
Submissions Evaluated: ${submissions.length} Scripts
On-Time Submissions: ${submissions.filter((s) => !s.isLate).length}
Late Exceptions: ${submissions.filter((s) => s.isLate).length}

STUDENT SUBMISSION EVALUATION LOG:
================================================================================
${submissions.length > 0 ? submissions
  .map((s, idx) => {
    const g = grades[s.id] || { marks: s.marksAwarded ?? 0, feedback: s.feedback };
    const saved = savedGrades[s.id]?.saved;
    return `${idx + 1}. SCHOLAR: ${s.studentName} (${s.studentId.toUpperCase()})
   Form: ${s.form} • File: ${s.fileName} (${s.fileSize})
   Submission Timestamp: ${s.submittedAt} (${s.isLate ? "Late Submission" : "On-Time"})
   Status: ${saved ? "Grade Published" : "Evaluation In Progress"}
   Marks Awarded: ${g.marks} / ${s.maxMarks} Marks (${Math.round((g.marks / s.maxMarks) * 100)}%)
   Qualitative Feedback: ${g.feedback || "Work evaluated."}`;
  })
  .join("\n\n") : "No submissions recorded."}
================================================================================

Verification Hash: OFFICIAL-EVAL-REPORT-VERIFIED
Official Evaluator Signature: ${profile?.full_name || "Faculty Evaluator"}`;

    setPreviewData({
      title: "Homework Submissions Evaluation Report",
      fileName: "Homework_Evaluation_Report.pdf",
      content: text,
      studentName: "Cohort",
      studentId: "COHORT",
      form: "Class",
    });
    setPreviewOpen(true);
  };

  const handlePreviewStudentScript = (sub: StudentHomeworkSubmission) => {
    const schoolName = currentSchool?.name || currentSchool?.legal_name || "School Administration";
    const g = grades[sub.id] || { marks: sub.marksAwarded ?? 0, feedback: sub.feedback };
    const text = `${schoolName}
OFFICIAL STUDENT HOMEWORK SCRIPT EVALUATION

STUDENT SPECIFICATIONS:
Scholar Name: ${sub.studentName}
Student ID / Roll: ${sub.studentId.toUpperCase()}
Class & Section: ${sub.form}

SUBMISSION RECORD:
Assignment Title: ${sub.homeworkTitle}
Submitted File: ${sub.fileName} (${sub.fileSize})
Submission Timestamp: ${sub.submittedAt}
Punctuality Status: ${sub.isLate ? "Late Submission" : "On-Time Submission"}

TOTAL MARKS AWARDED: ${g.marks} / ${sub.maxMarks} Marks (${Math.round((g.marks / sub.maxMarks) * 100)}%)
================================================================================

FEEDBACK & MENTORSHIP:
"${g.feedback || "Evaluated by course faculty."}"

Digital Hash: SCRIPT-EVAL-${sub.studentId.toUpperCase()}
Verified by Evaluator: ${profile?.full_name || "Faculty Evaluator"}`;

    setPreviewData({
      title: `${sub.studentName} — Homework Script Evaluation`,
      fileName: `${sub.studentName.replace(/\s+/g, "_")}_Evaluation.pdf`,
      content: text,
      studentName: sub.studentName,
      studentId: sub.studentId.toUpperCase(),
      form: sub.form,
    });
    setPreviewOpen(true);
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (activeTab === "PENDING") return !savedGrades[sub.id]?.saved;
    if (activeTab === "GRADED") return !!savedGrades[sub.id]?.saved;
    if (activeTab === "LATE") return sub.isLate;
    return true;
  });

  const gradedCount = submissions.filter((s) => savedGrades[s.id]?.saved).length;
  const pendingCount = submissions.length - gradedCount;
  const lateCount = submissions.filter((s) => s.isLate).length;

  return (
    <AppShell
      role="TEACHER"
      userName={profile?.full_name || "Teacher"}
      userRoleTitle={currentSchool?.name ? `Faculty • ${currentSchool.name}` : "Faculty Teacher"}
      epochText="Homework Review & Evaluation"
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
        {/* Breadcrumb Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-sans font-medium text-[#B45309]">
            <span>Grading Desk</span>
            <span>▸</span>
            <span>Form VI</span>
            <span>▸</span>
            <span>Tensor Calculus &amp; Riemannian Metrics</span>
            <span>▸</span>
            <span>PS4</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#0B1E48] tracking-tight">
                Homework Review &amp; Evaluation Desk
              </h1>
              <p className="font-sans text-sm text-[#5B6B87] max-w-2xl">
                Inspect student script submissions, assign points according to classical rubrics, and deliver qualitative mentorship feedback.
              </p>
            </div>

            {/* Right Top Illustration & Submissions Progress Meter */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Notebook Illustration with Typography */}
              <div className="relative w-40 h-20 flex items-center justify-center">
                <svg viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
                  {/* Spiral Notebook Cover */}
                  <rect x="15" y="10" width="70" height="60" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                  {/* Spiral rings */}
                  <circle cx="15" cy="20" r="2.5" fill="#94A3B8" />
                  <circle cx="15" cy="30" r="2.5" fill="#94A3B8" />
                  <circle cx="15" cy="40" r="2.5" fill="#94A3B8" />
                  <circle cx="15" cy="50" r="2.5" fill="#94A3B8" />
                  <circle cx="15" cy="60" r="2.5" fill="#94A3B8" />
                  {/* Lines on page */}
                  <line x1="26" y1="22" x2="75" y2="22" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="26" y1="32" x2="75" y2="32" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="26" y1="42" x2="75" y2="42" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="26" y1="52" x2="65" y2="52" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Pencil */}
                  <line x1="88" y1="12" x2="62" y2="68" stroke="#EA580C" strokeWidth="4" strokeLinecap="round" />
                  <polygon points="62,68 58,76 66,72" fill="#FBBF24" />
                  <polygon points="58,76 57,78 60,77" fill="#1E293B" />
                </svg>
                {/* Typography overlay beside notebook */}
                <div className="absolute right-0 top-2 text-[10px] font-serif italic font-bold text-[#78350F] leading-tight text-right space-y-0.5 pr-1">
                  <div>Review</div>
                  <div>Feedback</div>
                  <div>Inspire</div>
                  <div className="text-[#0A369D] font-sans text-[9px] font-semibold">Better Learners</div>
                </div>
              </div>

              {/* Submissions Count & Progress Bar Card */}
              <div className="bg-white border border-gray-200/90 rounded-2xl p-3.5 shadow-xs w-48 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-2xl font-bold text-[#0B1E48]">
                    {submissions.length}
                  </span>
                  <div>
                    <div className="font-bold text-xs text-[#0B1E48]">Submissions</div>
                    <div className="text-[10px] text-[#718096]">
                      {gradedCount} Graded • {pendingCount} Pending
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-[#1D7C3F] transition-all"
                    style={{ width: `${(gradedCount / (submissions.length || 1)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-gray-200 transition-all"
                    style={{ width: `${(pendingCount / (submissions.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
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
            name: previewData.studentName || "Class 12-A Scholar",
            rollNumber: previewData.studentId || "ADM-2024-001",
            form: previewData.form || "Class 12-A",
            house: "Department of Mathematics",
            institutionName: "DELHI PUBLIC SCHOOL, R.K. PURAM",
            institutionAffiliation: "Affiliated to Central Board of Secondary Education (CBSE) • Affiliation No: 2730017",
            institutionAddress: "Sector XII, R.K. Puram, New Delhi - 110022 • School Code: 85214",
            academicSession: "2024–2025",
          }}
        />

        {/* Filter Tabs & Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Pill Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "ALL"
                  ? "bg-[#0A369D] text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              All Submissions ({submissions.length})
            </button>
            <button
              onClick={() => setActiveTab("PENDING")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "PENDING"
                  ? "bg-[#0A369D] text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab("GRADED")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "GRADED"
                  ? "bg-[#0A369D] text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Graded ({gradedCount})
            </button>
            <button
              onClick={() => setActiveTab("LATE")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "LATE"
                  ? "bg-[#0A369D] text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Late ({lateCount})
            </button>
          </div>

          {/* Right Sort Dropdown & Export PDF button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportEvaluationReport}
              className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50 gap-1.5 h-8.5 rounded-lg"
            >
              <FileText className="w-3.5 h-3.5 text-[#0A369D]" />
              Export Report (PDF)
            </Button>
            <div className="relative">
              <button className="h-8.5 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-medium flex items-center gap-1.5 hover:bg-gray-50">
                Sort by: Submission Date (Latest)
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Student Submission Cards */}
        <div className="space-y-4">
          {filteredSubmissions.map((sub, idx) => {
            const gradeInfo = grades[sub.id] || { marks: 45, feedback: "" };
            const isSaved = savedGrades[sub.id]?.saved;
            const publishedDate = savedGrades[sub.id]?.date || "2025-01-27";

            // Avatar colors based on index
            const avatarBgs = [
              "bg-blue-100 text-blue-700 border-blue-200",
              "bg-purple-100 text-purple-700 border-purple-200",
              "bg-amber-100 text-amber-700 border-amber-200",
              "bg-emerald-100 text-emerald-700 border-emerald-200",
            ];
            const avatarBg = avatarBgs[idx % avatarBgs.length];
            const initials = sub.studentName
              .split(" ")
              .map((n) => n[0])
              .join("");

            return (
              <Card
                key={sub.id}
                className="p-5 bg-white border border-gray-200/90 rounded-2xl shadow-xs transition-shadow hover:shadow-sm"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  {/* Left Col (Col 1-4): Scholar Info & Submitted File */}
                  <div className="lg:col-span-4 space-y-2">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border shadow-2xs ${avatarBg}`}
                      >
                        {initials}
                      </div>

                      {/* Name, Form & Status Badge */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#0F172A] text-sm">
                            {sub.studentName}
                          </h3>
                          {sub.isLate ? (
                            <span className="bg-[#FFF0F0] text-[#D32F2F] border border-[#FFCDD2] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              LATE SUBMISSION
                            </span>
                          ) : (
                            <span className="bg-[#EBFBF0] text-[#1D7C3F] border border-[#C3ECD0] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              ON TIME
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#718096] font-medium">
                          {sub.form}
                        </div>
                      </div>
                    </div>

                    {/* Submitted timestamp */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#718096] pl-1 font-mono">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>Submitted: {sub.submittedAt}</span>
                    </div>

                    {/* PDF Script preview link */}
                    <button
                      type="button"
                      onClick={() => handlePreviewStudentScript(sub)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#D32F2F] hover:underline pl-1 group"
                    >
                      <span className="w-4 h-4 bg-[#D32F2F] text-white rounded text-[8px] font-bold flex items-center justify-center">
                        PDF
                      </span>
                      <span className="text-gray-700 font-sans group-hover:text-[#0A369D]">
                        {sub.fileName} ({sub.fileSize})
                      </span>
                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#0A369D]" />
                    </button>
                  </div>

                  {/* Middle Col 1 (Col 5-6): Marks Awarded Box */}
                  <div className="lg:col-span-2 flex flex-col items-center lg:items-start justify-center space-y-1.5">
                    <span className="text-[11px] font-bold text-[#0B1E48]">
                      Marks Awarded (/ {sub.maxMarks})
                    </span>
                    <div className="w-24 h-14 bg-[#FDF8EC] border border-[#F3E7C4] rounded-xl flex items-center justify-center shadow-2xs">
                      <input
                        type="number"
                        min={0}
                        max={sub.maxMarks}
                        value={gradeInfo.marks}
                        onChange={(e) => handleGradeChange(sub.id, "marks", Number(e.target.value))}
                        className="w-full text-center bg-transparent font-serif text-2xl font-bold text-[#96631E] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Middle Col 2 (Col 7-9): Qualitative Feedback */}
                  <div className="lg:col-span-4 space-y-1.5">
                    <span className="text-[11px] font-bold text-[#0B1E48]">
                      Senior Master Qualitative Feedback
                    </span>
                    <textarea
                      rows={2}
                      value={gradeInfo.feedback}
                      onChange={(e) => handleGradeChange(sub.id, "feedback", e.target.value)}
                      placeholder="Provide constructive notes & advice..."
                      className="w-full p-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs text-gray-800 leading-relaxed focus:bg-white focus:outline-none focus:border-[#0A369D]"
                    />
                  </div>

                  {/* Right Col (Col 10-12): Publish / Published Button & Timestamp */}
                  <div className="lg:col-span-2 flex flex-col items-center lg:items-end justify-center space-y-1">
                    {isSaved ? (
                      <div className="w-full flex flex-col items-center lg:items-end">
                        <button
                          type="button"
                          onClick={() => handlePreviewStudentScript(sub)}
                          className="w-full bg-[#EBFBF0] text-[#1D7C3F] border border-[#C3ECD0] px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#d8f5df] transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Grade Published
                        </button>
                        <span className="text-[10px] text-[#718096] mt-1 font-mono">
                          Published on {publishedDate}
                        </span>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center lg:items-end">
                        <Button
                          onClick={() => handlePublishGrade(sub)}
                          className="w-full bg-[#0A369D] hover:bg-[#082977] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" /> Publish Grade &amp; Feedback
                        </Button>
                        <span className="text-[10px] text-[#718096] mt-1 font-mono">
                          Not yet published
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom Motivational Quote Banner */}
        <TeacherQuoteBanner
          icon={<GraduationCap className="w-6 h-6 text-white" />}
          iconBgClass="bg-[#0A369D] text-white"
          title="Fair Evaluation. Brighter Futures."
          subtitle="Your feedback helps students grow and achieve their potential."
          quote="Teachers don't just grade work, they build possibilities."
        />
      </div>
    </AppShell>
  );
}

