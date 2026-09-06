"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Modal } from "@/components/ui/modal";
import {
  fetchEnrolledWards,
  fetchWardHomework,
  ParentWardProfile,
  WardHomeworkItem,
} from "@/lib/db/parent";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  Award,
  FileText,
  MessageSquareQuote,
  Sparkles,
  Calendar,
  ChevronRight,
  BarChart3,
  GraduationCap,
  ArrowRight,
  Download,
} from "lucide-react";
import { PdfPreviewModal } from "@/components/ui/pdf-preview-modal";
import { useAuth } from "@/components/providers/auth-context";

export default function ParentHomeworkPage() {
  const { profile, currentSchool } = useAuth();
  const [wards, setWards] = React.useState<ParentWardProfile[]>([]);
  const [selectedWardId, setSelectedWardId] = React.useState<string>("");
  const [homeworkList, setHomeworkList] = React.useState<WardHomeworkItem[]>([]);
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [isLoading, setIsLoading] = React.useState(true);
  const [previewDoc, setPreviewDoc] = React.useState<{
    isOpen: boolean;
    title: string;
    fileName: string;
    content: string;
    studentMeta?: { name?: string; form?: string; rollNumber?: string; house?: string };
  } | null>(null);

  // Inspection Modal
  const [selectedHw, setSelectedHw] = React.useState<WardHomeworkItem | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const wardsData = await fetchEnrolledWards();
        setWards(wardsData);
        const activeId = selectedWardId || (wardsData[0] ? wardsData[0].id : "ward-01");
        const hwData = await fetchWardHomework(activeId);
        setHomeworkList(hwData);
      } catch (err) {
        console.error("Failed to load homework", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedWardId]);

  const activeWard = wards.find((w) => w.id === selectedWardId) || wards[0];

  const handleDownloadHomeworkPDF = (hw: WardHomeworkItem) => {
    const studentName = activeWard?.name || "Student";
    const studentForm = activeWard?.form || "Class";
    const studentRoll = activeWard?.rollNumber || "N/A";
    const studentHouse = activeWard?.house || "N/A";

    let content = "";
    if (hw.status === "GRADED") {
      content = `OFFICIAL HOMEWORK ASSESSMENT & EVALUATION REPORT
Document Ref: HW-EVAL-${hw.id.toUpperCase()}-${Date.now().toString().slice(-4)}
Academic Year: 2024–2025 • Term 2 (CBSE Board)

STUDENT DETAILS:
Student Name: ${studentName}
Class & Form: ${studentForm}
Admission Roll No: ${studentRoll}
House: ${studentHouse}

ASSIGNMENT DETAILS:
Subject: ${hw.subject}
Assignment Title: ${hw.title}
Evaluating Teacher: ${hw.teacherName}
Assigned Date: ${hw.assignedDate}
Submission Date: ${hw.dueDate}

EVALUATION & MARKS:
Awarded Score: ${hw.score} / ${hw.maxScore} (${Math.round(((hw.score || 0) / hw.maxScore) * 100)}%)
Grading Status: EVALUATED & VERIFIED
Rubric Assessment: ${hw.rubricSummary}

TEACHER'S REMARKS & FEEDBACK:
"${hw.teacherFeedback || "Excellent submission demonstrating thorough conceptual clarity."}"

TEACHER SIGNATURE: ${hw.teacherName}
Institutional Seal: AGRAGATI-SENIOR-SECONDARY-EVAL-SEAL`;
    } else {
      content = `OFFICIAL HOMEWORK WORKSHEET & PRACTICE TASK
Document Ref: HW-TASK-${hw.id.toUpperCase()}-${Date.now().toString().slice(-4)}
Academic Year: 2024–2025 • Term 2 (CBSE Board)

STUDENT DETAILS:
Student Name: ${studentName}
Class & Form: ${studentForm}
Admission Roll No: ${studentRoll}
House: ${studentHouse}

ASSIGNMENT BRIEF:
Subject: ${hw.subject}
Assignment Title: ${hw.title}
Assigned By: ${hw.teacherName}
Assigned Date: ${hw.assignedDate}
Submission Deadline: ${hw.dueDate} (04:00 PM IST)
Maximum Marks: ${hw.maxScore}

TASK INSTRUCTIONS & CURRICULUM RUBRIC:
${hw.rubricSummary}

GENERAL SUBMISSION GUIDELINES:
1. Complete all problem sets and diagrams in the dedicated subject register.
2. Label coordinate geometry axes and vector notation clearly as per CBSE marking schemes.
3. Bring completed worksheet for classroom discussion on ${hw.dueDate}.

Teacher in Charge: ${hw.teacherName}
Agragati Academy Department of Secondary Education`;
    }

    setPreviewDoc({
      isOpen: true,
      title: hw.status === "GRADED" ? `Evaluation Report • ${hw.subject}` : `Homework Worksheet • ${hw.subject}`,
      fileName: `${hw.status === "GRADED" ? "Evaluation_Report" : "Homework_Worksheet"}_${hw.subject.replace(/[^a-zA-Z0-9]/g, "_")}_${studentName.replace(/\s+/g, "_")}.pdf`,
      content,
      studentMeta: {
        name: studentName,
        form: studentForm,
        rollNumber: studentRoll,
        house: studentHouse,
      },
    });
  };

  const filteredHomework = homeworkList.filter((item) => {
    if (statusFilter === "ALL") return true;
    return item.status === statusFilter;
  });

  const pendingCount = homeworkList.filter((h) => h.status === "PENDING").length;
  const gradedCount = homeworkList.filter((h) => h.status === "GRADED").length;

  const getSubjectIconMeta = (subjectName: string) => {
    const s = subjectName.toLowerCase();
    if (s.includes("math")) {
      return {
        symbol: "Σ",
        color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200/60 dark:border-purple-800/50",
      };
    }
    if (s.includes("physic")) {
      return {
        symbol: "⚛",
        color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200/60 dark:border-rose-800/50",
      };
    }
    return {
      symbol: "💻",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/60 dark:border-emerald-800/50",
    };
  };

  return (
    <AppShell
      role="PARENT"
      userName={profile?.full_name || "Parent"}
      userRoleTitle={`Parent${activeWard?.name ? ` • ${activeWard.name}` : ""}`}
      epochText="Academic Assignments"
    >
      <div className="space-y-6">
        {/* Top Brow & Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[11px] font-bold text-[#8C6D27] dark:text-amber-400 uppercase tracking-widest">
                DAILY HOMEWORK &amp; ASSIGNMENTS
              </span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="font-sans text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                Student: {activeWard?.name} ({activeWard?.form})
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-stone-100">
              Homework &amp; Class Assignments
            </h1>
            <p className="font-sans text-xs md:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
              Track daily homework assignments, project topics, submission due dates, and teacher feedback.
            </p>
          </div>

          {/* Child Switcher */}
          <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
            {wards.map((w) => {
              const isActive = w.id === selectedWardId;
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWardId(w.id)}
                  className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#8C6D27] text-white shadow-xs"
                      : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                  }`}
                >
                  {w.name.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Pending Homework */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF1F2] dark:bg-rose-950/40 text-[#F43F5E] flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="font-sans text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
                  PENDING HOMEWORK
                </span>
                <div className="font-serif text-2xl md:text-3xl font-bold text-[#E11D48] mt-0.5">
                  {pendingCount} Tasks Due
                </div>
                <span className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">
                  Due in the next 5 days
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </div>

          {/* Card 2: Checked & Graded */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/40 text-[#10B981] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
                CHECKED &amp; GRADED
              </span>
              <div className="font-serif text-2xl md:text-3xl font-bold text-[#059669] mt-0.5">
                {gradedCount} Checked (98.0% Score)
              </div>
              <span className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">
                Excellent remarks by teacher
              </span>
            </div>
          </div>

          {/* Card 3: Upcoming Due Date */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F5F3FF] dark:bg-purple-950/40 text-[#8B5CF6] flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="font-sans text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
                  UPCOMING DUE DATE
                </span>
                <div className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  Jan 27, 2025
                </div>
                <span className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">
                  Mathematics (Vector Algebra)
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        {/* 3 Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "ALL", label: `All Homework (${homeworkList.length})` },
            { id: "PENDING", label: `Pending (${pendingCount})` },
            { id: "GRADED", label: `Checked & Graded (${gradedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-[#8C6D27] text-white shadow-xs"
                  : "bg-white dark:bg-[#151922] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Homework Items List */}
        <div className="space-y-4">
          {filteredHomework.map((hw) => {
            const iconMeta = getSubjectIconMeta(hw.subject);
            return (
              <div
                key={hw.id}
                className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-amber-300 dark:hover:border-amber-700/50"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                  {/* Left: Icon + Content */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-serif font-bold text-xl shrink-0 ${iconMeta.color}`}>
                      {iconMeta.symbol}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {hw.subject}
                        </span>
                        <span className="text-stone-300 dark:text-stone-700">•</span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          Assigned by: <strong>{hw.teacherName}</strong>
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
                        {hw.title}
                      </h3>

                      <p className="font-sans text-xs text-stone-600 dark:text-stone-300 max-w-3xl leading-relaxed">
                        {hw.rubricSummary}
                      </p>

                      {/* Teacher Feedback Callout (if graded) */}
                      {hw.teacherFeedback && (
                        <div className="mt-3 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-[#8C6D27] dark:text-amber-400 mb-1">
                            <MessageSquareQuote className="w-3.5 h-3.5" />
                            <span>Teacher&apos;s Feedback &amp; Remarks:</span>
                          </div>
                          <p className="font-serif italic text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                            &ldquo;{hw.teacherFeedback}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Due Date / Score + Action */}
                  <div className="shrink-0 flex flex-col sm:items-end justify-between self-stretch pt-3 md:pt-0 border-t md:border-t-0 border-stone-100 dark:border-stone-800">
                    <div className="text-left sm:text-right space-y-1">
                      {hw.status === "GRADED" ? (
                        <div>
                          <span className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {hw.score} / {hw.maxScore}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block uppercase tracking-wider">
                            Checked &amp; Scored
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800/50">
                            📅 Due: {hw.dueDate}
                          </span>
                          <span className="text-[11px] text-stone-400 block mt-1">
                            Total Marks: {hw.maxScore}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => handleDownloadHomeworkPDF(hw)}
                        title={hw.status === "GRADED" ? "Download Scorecard (PDF)" : "Download Worksheet (PDF)"}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-amber-50 dark:bg-amber-950/40 text-[#8C6D27] dark:text-amber-300 hover:bg-amber-100 text-xs font-semibold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{hw.status === "GRADED" ? "Scorecard" : "Worksheet"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedHw(hw)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1a1f2c] text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-semibold transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational Bottom Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-[#FFFBF0] dark:bg-[#171d29] border border-amber-200/80 dark:border-amber-900/40 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 dark:bg-amber-950/60 text-[#8C6D27] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Small steps every day lead to big achievements.
              </h3>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Regular practice and timely submission build strong academic foundations.
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-serif italic text-xs md:text-sm text-stone-700 dark:text-stone-300">
              &ldquo;Consistent learning builds lasting confidence.&rdquo;
            </p>
          </div>
        </div>

        {/* Homework Detail Modal */}
        <Modal
          isOpen={!!selectedHw}
          onClose={() => setSelectedHw(null)}
          title="Homework Details & Teacher Feedback"
          description={selectedHw ? `${selectedHw.subject} • ${selectedHw.title}` : ""}
          maxWidth="lg"
        >
          {selectedHw && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    {selectedHw.title}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200">
                    {selectedHw.status}
                  </span>
                </div>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                  {selectedHw.rubricSummary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white dark:bg-[#151922] border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-400 block text-[11px]">Assigned Date</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{selectedHw.assignedDate}</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#151922] border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-400 block text-[11px]">Due Date</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{selectedHw.dueDate}</span>
                </div>
              </div>

              {selectedHw.teacherFeedback && (
                <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
                  <span className="font-bold text-[#8C6D27] dark:text-amber-300 block">
                    Teacher&apos;s Remarks ({selectedHw.teacherName})
                  </span>
                  <p className="font-serif italic text-stone-700 dark:text-stone-300 text-xs leading-relaxed">
                    &ldquo;{selectedHw.teacherFeedback}&rdquo;
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleDownloadHomeworkPDF(selectedHw)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8C6D27] text-white text-xs font-bold hover:bg-[#785c1f] transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{selectedHw.status === "GRADED" ? "Download Scorecard (PDF)" : "Download Worksheet (PDF)"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedHw(null)}
                  className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          )}
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
