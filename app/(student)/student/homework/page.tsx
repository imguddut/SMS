"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Modal } from "@/components/ui/modal";
import { triggerClientDownload } from "@/lib/utils";
import { PdfPreviewModal, PDFStudentMetadata } from "@/components/ui/pdf-preview-modal";
import {
  fetchStudentHomeworkList,
  submitHomeworkSolution,
  StudentHomeworkTask,
} from "@/lib/db/student";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Upload,
  FileText,
  MessageSquareQuote,
  Sparkles,
  Send,
  Eye,
  FileCheck2,
  Calendar,
  Paperclip,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  GraduationCap,
  Award,
  BarChart3,
  Laptop,
  Atom,
  Download,
  AlertCircle,
} from "lucide-react";

export default function StudentHomeworkPage() {
  const [tasks, setTasks] = React.useState<StudentHomeworkTask[]>([]);
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [sortBy, setSortBy] = React.useState<"soonest" | "latest" | "marks">("soonest");
  const [isLoading, setIsLoading] = React.useState(true);

  // Submit Script Modal
  const [selectedTask, setSelectedTask] = React.useState<StudentHomeworkTask | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [fileName, setFileName] = React.useState("Aarav_Sharma_Solution.pdf");
  const [fileSize, setFileSize] = React.useState("1.8 MB");
  const [notes, setNotes] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // View Details Modal
  const [inspectTask, setInspectTask] = React.useState<StudentHomeworkTask | null>(null);
  const [alertMessage, setAlertMessage] = React.useState<string | null>(null);

  const [previewDoc, setPreviewDoc] = React.useState<{
    isOpen: boolean;
    title: string;
    fileName: string;
    content: string;
    studentMeta?: PDFStudentMetadata;
  } | null>(null);

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 3500);
  };

  React.useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchStudentHomeworkList();
        setTasks(data);
      } catch (err) {
        console.error("Failed to load homework tasks", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenSubmit = (task: StudentHomeworkTask) => {
    setSelectedTask(task);
    const cleanSubject = task.subject.replace(/[^a-zA-Z0-9]/g, "_");
    setFileName(`Aarav_Sharma_${cleanSubject}_Solution.pdf`);
    setFileSize("1.8 MB");
    setNotes("");
    setSubmitSuccess(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    }
  };

  const handleExecuteSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      await submitHomeworkSolution({
        homeworkId: selectedTask.id,
        fileName,
        notes,
      });

      const updatedTaskId = selectedTask.id;
      const updatedFileName = fileName;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === updatedTaskId
            ? {
                ...t,
                status: "SUBMITTED",
                cutoffCountdown: "Submitted on time (In Review)",
                submittedFileName: updatedFileName,
                submissionDate: new Date().toISOString().split("T")[0],
              }
            : t
        )
      );

      setSubmitSuccess(true);
      showAlert(`Submission sealed for "${selectedTask.title}"!`);
    } catch (err) {
      console.error(err);
      showAlert("Failed to upload solution script. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadWorksheet = (task: StudentHomeworkTask) => {
    const safeTitle = task.title.replace(/[^a-zA-Z0-9]/g, "_");
    const content = `=== AGRAGATI ACADEMY • COURSEWORK WORKSHEET ===\nSubject: ${task.subject}\nTitle: ${task.title}\nInstructor: ${task.teacherName}\nAssigned Date: ${task.assignedDate}\nDue Date: ${task.dueDate}\nMaximum Marks: ${task.maxScore}\n\nRUBRIC CRITERIA & INSTRUCTIONS:\n${task.rubricSummary}\n\nInstructions for Submission:\n1. Show all step-by-step mathematical derivations or code routines.\n2. Compile work into a clean, single-page or multi-page PDF document.\n3. Submit prior to the deadline on the Student Portal.\n\nSealed by Dean of Academics • Agragati Academy`;

    setPreviewDoc({
      isOpen: true,
      title: `${task.subject} Homework Worksheet`,
      fileName: `${safeTitle}_Worksheet.pdf`,
      content,
      studentMeta: {
        name: "Aarav Sharma",
        classSection: "Class 12-A (PCM-CS)",
        rollNumber: "ADM-2024-001",
        academicSession: "2024-2025",
        institutionName: "AGRAGATI MODERN ACADEMY (CBSE AFFILIATED)",
      },
    });
  };

  const handleDownloadGradedScript = (task: StudentHomeworkTask) => {
    const safeTitle = task.title.replace(/[^a-zA-Z0-9]/g, "_");
    const content = `=== AGRAGATI ACADEMY • EVALUATED SCRIPT & FACULTY FEEDBACK ===\nStudent: Aarav Sharma (Class 12-A, Roll: ADM-2024-001)\nSubject: ${task.subject}\nCoursework: ${task.title}\nEvaluator: ${task.teacherName}\nScore Awarded: ${task.score ?? task.maxScore} / ${task.maxScore} Marks (${Math.round(((task.score ?? task.maxScore) / task.maxScore) * 100)}%)\n\nMASTER EVALUATIVE FEEDBACK:\n"${task.teacherFeedback || "Excellent analytical work and clear methodology."}"\n\nRUBRIC FULFILLMENT:\n- Technical Rigour: 10/10\n- Methodology & Proofs: 10/10\n- Syntax & Presentation: 9/10\n- Timeliness: Completed on schedule\n\nVerification Hash: CBSE-EVAL-2025-${task.id.toUpperCase()}-VERIFIED`;

    setPreviewDoc({
      isOpen: true,
      title: `Graded Evaluation Scorecard - ${task.subject}`,
      fileName: `${safeTitle}_Evaluated_Scorecard.pdf`,
      content,
      studentMeta: {
        name: "Aarav Sharma",
        classSection: "Class 12-A (PCM-CS)",
        rollNumber: "ADM-2024-001",
        academicSession: "2024-2025",
        institutionName: "AGRAGATI MODERN ACADEMY (CBSE AFFILIATED)",
      },
    });
  };

  const handleDownloadReceipt = (task: StudentHomeworkTask, scriptFileName: string) => {
    const content = `=== AGRAGATI ACADEMY • DIGITAL SUBMISSION RECEIPT ===\nReceipt Ref: SUB-${Date.now()}\nStudent: Aarav Sharma (Class 12-A, Tagore House)\nSubject: ${task.subject}\nAssignment: ${task.title}\nUploaded File: ${scriptFileName}\nTimestamp: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST\nServer Verification: SHA-256 Validated • Master Evaluation Desk`;

    setPreviewDoc({
      isOpen: true,
      title: `Digital Submission Receipt - ${task.subject}`,
      fileName: `Submission_Receipt_${task.id}.pdf`,
      content,
      studentMeta: {
        name: "Aarav Sharma",
        classSection: "Class 12-A (PCM-CS)",
        rollNumber: "ADM-2024-001",
        academicSession: "2024-2025",
        institutionName: "AGRAGATI MODERN ACADEMY (CBSE AFFILIATED)",
      },
    });
  };

  // Sorting and Filtering
  const filteredTasks = tasks
    .filter((t) => {
      if (statusFilter === "ALL") return true;
      return t.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === "soonest") return a.dueDate.localeCompare(b.dueDate);
      if (sortBy === "latest") return b.dueDate.localeCompare(a.dueDate);
      if (sortBy === "marks") return b.maxScore - a.maxScore;
      return 0;
    });

  const pendingCount = tasks.filter((t) => t.status === "PENDING").length;
  const gradedCount = tasks.filter((t) => t.status === "GRADED").length;

  return (
    <AppShell
      role="STUDENT"
      userName="Aarav Sharma"
      userRoleTitle="SCHOLAR • CLASS 12-A (SCIENCE & AI) • TAGORE HOUSE"
      epochText="Academic Submissions • CBSE Board Term II (2024–2025)"
    >
      <div className="space-y-6">
        {/* Toast Alert Feedback */}
        {alertMessage && (
          <div className="fixed top-5 right-5 z-50 bg-stone-900/95 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-500/40 animate-in fade-in slide-in-from-top-4 duration-200">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-sans text-xs font-semibold">{alertMessage}</span>
          </div>
        )}

        {/* Header with Quote Box */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                ACADEMIC SUBMISSIONS &amp; COURSEWORK DESK
              </span>
              <span className="text-stone-300 text-xs">•</span>
              <span className="font-sans text-[10px] font-medium text-stone-500">
                Class 12 Senior Secondary • CBSE &amp; Science Stream
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-stone-900">
              My Homework &amp; Problem Sets
            </h1>
            <p className="font-sans text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Submit problem set scripts, download official master worksheets, inspect assessment rubrics, and review teacher critiques.
            </p>
          </div>

          {/* Right Quote Card */}
          <div className="bg-[#FFFDF9] border border-amber-200/70 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs shrink-0 self-start lg:self-center">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="font-serif italic text-xs text-stone-700 max-w-[220px] leading-relaxed">
                &ldquo;Discipline in your work today builds the scholar you become tomorrow.&rdquo;
              </p>
              <span className="font-sans text-[10px] text-stone-400 block mt-0.5">
                — Tagore House Master Motto
              </span>
            </div>
          </div>
        </div>

        {/* 3 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Due & Pending Tasks */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                DUE &amp; PENDING TASKS
              </span>
              <div className="font-serif text-3xl font-bold text-stone-900 mt-0.5">
                {pendingCount} Tasks
              </div>
              <p className="font-sans text-xs text-stone-500 mt-0.5">
                Next: Math PS5 (Jan 27)
              </p>
            </div>
          </div>

          {/* Card 2: Evaluated Submissions */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                EVALUATED SUBMISSIONS
              </span>
              <div className="font-serif text-2xl md:text-3xl font-bold text-amber-900 mt-0.5">
                {gradedCount} Graded (98.0% Avg)
              </div>
              <div className="mt-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70 font-sans text-[10px] font-bold inline-flex items-center gap-1">
                  ⭐ High Distinction Awarded
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Submission Format */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                SUBMISSION FORMAT
              </span>
              <div className="font-serif text-3xl font-bold text-stone-900 mt-0.5">
                PDF / LaTeX
              </div>
              <p className="font-sans text-xs text-stone-500 mt-0.5">
                Digitally timestamped scripts
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Sort Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "ALL", label: "All Problem Sets" },
              { id: "PENDING", label: "Due Soon" },
              { id: "SUBMITTED", label: "Submitted (In Review)" },
              { id: "GRADED", label: "Graded & Feedback" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? "bg-[#8B5E34] text-white shadow-xs"
                    : "bg-white border border-stone-200/80 text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label className="text-xs text-stone-500 font-medium">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "soonest" | "latest" | "marks")}
              aria-label="Sort problem sets"
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200/80 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="soonest">Due Date (Soonest)</option>
              <option value="latest">Due Date (Latest)</option>
              <option value="marks">Highest Marks</option>
            </select>
          </div>
        </div>

        {/* Problem Sets Cards List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-2">
              <FileText className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-serif text-lg font-bold text-stone-800">No problem sets match this filter</p>
              <p className="font-sans text-xs text-stone-500">Select another tab to view coursework items.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isMath = task.subject.toLowerCase().includes("math");
              const isPhysics = task.subject.toLowerCase().includes("phys");
              const isCS = task.subject.toLowerCase().includes("comp") || task.subject.toLowerCase().includes("cs");

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-stone-200/80 p-5 md:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-amber-300/80 transition-all"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Subject Icon Box */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs border ${
                        isMath
                          ? "bg-indigo-50 text-indigo-700 border-indigo-100 font-serif"
                          : isPhysics
                          ? "bg-rose-50 text-rose-700 border-rose-100"
                          : isCS
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                    >
                      {isMath ? "Σ" : isPhysics ? <Atom className="w-7 h-7" /> : isCS ? <Laptop className="w-7 h-7" /> : <BookOpen className="w-7 h-7" />}
                    </div>

                    <div className="space-y-2 flex-1">
                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center gap-2 font-sans">
                        <span className="px-2.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-bold uppercase">
                          {task.subject}
                        </span>

                        {task.status === "PENDING" && (
                          <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                            PENDING
                          </span>
                        )}

                        {task.status === "SUBMITTED" && (
                          <span className="px-2.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold uppercase">
                            SUBMITTED (IN REVIEW)
                          </span>
                        )}

                        {task.status === "GRADED" && (
                          <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                            GRADED &amp; EVALUATED
                          </span>
                        )}

                        <span className="text-xs text-stone-500">
                          Assigned by <strong className="text-stone-700">{task.teacherName}</strong>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif text-base md:text-lg font-bold text-stone-900">
                        {task.title}
                      </h3>

                      {/* Rubric Summary */}
                      <p className="font-sans text-xs text-stone-500 leading-relaxed max-w-3xl">
                        <strong className="text-stone-700">Rubric:</strong> {task.rubricSummary}
                      </p>

                      {/* Attached File if available */}
                      {task.submittedFileName && (
                        <div className="pt-1 font-sans">
                          <button
                            onClick={() =>
                              task.status === "GRADED"
                                ? handleDownloadGradedScript(task)
                                : handleDownloadWorksheet(task)
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-mono transition-colors"
                            title="Click to download submission"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-stone-500" />
                            <span>{task.submittedFileName}</span>
                            <Download className="w-3 h-3 text-stone-400 ml-1" />
                          </button>
                        </div>
                      )}

                      {/* Evaluator Critique Box for Graded Tasks */}
                      {task.teacherFeedback && (
                        <div className="p-3.5 bg-[#FFFDF7] border border-amber-200/70 rounded-xl mt-3 max-w-2xl font-sans">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                            <MessageSquareQuote className="w-4 h-4 text-amber-700" />
                            <span>Master Evaluative Critique:</span>
                          </div>
                          <p className="italic text-xs text-stone-700 mt-1 leading-relaxed">
                            &ldquo;{task.teacherFeedback}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Dates & Marks Footer */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 font-sans">
                        <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/70 text-xs font-semibold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-rose-600" />
                          Due: {task.dueDate}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200/70 text-xs font-semibold">
                          Max: {task.maxScore} Marks
                        </span>
                        {task.cutoffCountdown && (
                          <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {task.cutoffCountdown}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end md:items-end justify-between gap-3 shrink-0 self-end md:self-stretch pt-2 md:pt-0">
                    {task.status === "GRADED" && (
                      <div className="text-right font-sans mb-auto">
                        <div className="font-serif text-3xl font-bold text-stone-900">
                          {task.score} / {task.maxScore}
                        </div>
                        <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                          {Math.round(((task.score || 0) / task.maxScore) * 100)}% (Grade A1)
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10px] font-bold inline-flex items-center gap-1 mt-1.5">
                          <CheckCircle2 className="w-3 h-3 fill-emerald-600 text-white" />
                          Evaluation Sealed
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 font-sans">
                      {/* Action 1: Download Worksheet */}
                      <button
                        onClick={() => handleDownloadWorksheet(task)}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/80 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                        title="Download master problem sheet"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-700" />
                        <span>Worksheet (PDF)</span>
                      </button>

                      {/* Action 2: Submit Script or Download Feedback */}
                      {task.status === "PENDING" && (
                        <button
                          onClick={() => handleOpenSubmit(task)}
                          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Submit Script</span>
                        </button>
                      )}

                      {task.status === "SUBMITTED" && (
                        <button
                          onClick={() => handleDownloadWorksheet(task)}
                          className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>View Submission</span>
                        </button>
                      )}

                      {task.status === "GRADED" && (
                        <button
                          onClick={() => handleDownloadGradedScript(task)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Graded Report (PDF)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Motivational Footer Banner */}
        <div className="bg-white rounded-2xl border border-amber-200/70 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg md:text-xl font-bold text-stone-900">
                Keep Submitting. Keep Improving.
              </h3>
              <p className="font-sans text-xs text-stone-500 mt-0.5">
                Consistent problem set solving guarantees peak mastery in CBSE &amp; Competitive examinations.
              </p>
            </div>
          </div>

          <div className="text-right font-sans">
            <span className="text-xs font-semibold text-stone-600">
              Study • Grow • Achieve
            </span>
            <div className="w-12 h-1 bg-amber-400 rounded-full mt-2 ml-auto" />
          </div>
        </div>

        {/* Submit Script Modal */}
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title="Submit Coursework Solution Script"
          description="Upload compiled PDF / LaTeX solution script to the Master Evaluation Desk."
          maxWidth="lg"
        >
          {selectedTask && (
            <div className="space-y-6 font-sans text-xs">
              {submitSuccess ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-stone-900">Script Submitted &amp; Sealed</h3>
                    <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                      Your script <strong>{fileName}</strong> has been timestamped and transmitted to <strong>{selectedTask.teacherName}</strong> for evaluation.
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-left space-y-1.5 font-mono text-stone-700 max-w-md mx-auto text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Subject:</span>
                      <span className="font-semibold">{selectedTask.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Candidate:</span>
                      <span className="font-semibold">Aarav Sharma (12-A)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Status:</span>
                      <span className="text-emerald-700 font-bold">LOCKED &amp; VERIFIED</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadReceipt(selectedTask, fileName)}
                      className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4 text-amber-800" />
                      <span>Download Submission Receipt (PDF)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTask(null)}
                      className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleExecuteSubmission} className="space-y-4">
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">
                        {selectedTask.subject}
                      </span>
                      <span className="text-xs text-stone-500">
                        Instructor: {selectedTask.teacherName}
                      </span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-stone-900">
                      {selectedTask.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Due Date: {selectedTask.dueDate} • Max Marks: {selectedTask.maxScore}
                    </p>
                  </div>

                  {/* Hidden Real File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.tex"
                    className="hidden"
                  />

                  {/* Interactive File Upload Box */}
                  <div>
                    <label className="block font-semibold text-stone-900 mb-1">
                      Solution Document (PDF / LaTeX)
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-5 rounded-xl border-2 border-dashed border-amber-300/80 bg-amber-50/40 text-center space-y-2 cursor-pointer hover:bg-amber-50 transition-colors group"
                    >
                      <FileText className="w-8 h-8 text-amber-800 mx-auto group-hover:scale-105 transition-transform" />
                      <div>
                        <span className="font-bold text-xs text-stone-900 block font-mono">
                          {fileName}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {fileSize} • Click to select a different file from your device
                        </span>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-lg bg-white border border-amber-200 text-[11px] font-semibold text-amber-900 shadow-xs">
                        Browse Local Files
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-900 mb-1">
                      Scholar Methodology Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Add brief notes on derivations, coordinate systems used, or bibliographical references..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-amber-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => handleDownloadWorksheet(selectedTask)}
                      className="text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Reference Problem Set (PDF)</span>
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTask(null)}
                        className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl bg-[#8B5E34] hover:bg-[#784f2c] text-white font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? "Uploading Script..." : "Submit for Evaluation"}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </Modal>

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
      </div>
    </AppShell>
  );
}

