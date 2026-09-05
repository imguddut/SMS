"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Modal } from "@/components/ui/modal";
import {
  fetchStudentProfile,
  fetchStudentSchedule,
  fetchStudentHomeworkList,
  fetchStudentNotices,
  submitHomeworkSolution,
  StudentProfile,
  StudentSessionItem,
  StudentHomeworkTask,
  StudentBulletinItem,
} from "@/lib/db/student";
import { triggerClientDownload } from "@/lib/utils";
import { PdfPreviewModal, PDFStudentMetadata } from "@/components/ui/pdf-preview-modal";
import { useRealtimeEvent } from "@/components/providers/realtime-provider";
import {
  Calendar,
  CalendarDays,
  BookOpen,
  Award,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Users,
  Building2,
  Flame,
  Sparkles,
  ChevronRight,
  Send,
  Upload,
  Trophy,
  Moon,
  Check,
  FileText,
  Radio,
  MapPin,
  Megaphone,
  Download,
} from "lucide-react";

export default function StudentHomePage() {
  const [profile, setProfile] = React.useState<StudentProfile | null>(null);
  const [schedule, setSchedule] = React.useState<StudentSessionItem[]>([]);
  const [homework, setHomework] = React.useState<StudentHomeworkTask[]>([]);
  const [notices, setNotices] = React.useState<StudentBulletinItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Quick Submit Modal
  const [selectedTask, setSelectedTask] = React.useState<StudentHomeworkTask | null>(null);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  // Notice Inspection Modal
  const [selectedNotice, setSelectedNotice] = React.useState<StudentBulletinItem | null>(null);

  const [previewDoc, setPreviewDoc] = React.useState<{
    isOpen: boolean;
    title: string;
    fileName: string;
    content: string;
    studentMeta?: PDFStudentMetadata;
  } | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [profData, schedData, hwData, noticeData] = await Promise.all([
          fetchStudentProfile(),
          fetchStudentSchedule(),
          fetchStudentHomeworkList(),
          fetchStudentNotices(),
        ]);
        setProfile(profData);
        setSchedule(schedData);
        setHomework(hwData);
        setNotices(noticeData);
      } catch (err) {
        console.error("Failed to load student dashboard", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  useRealtimeEvent("homework_assignments", "*", async () => {
    try {
      const hwData = await fetchStudentHomeworkList();
      setHomework(hwData);
    } catch (err) {
      console.error(err);
    }
  });

  useRealtimeEvent("notices", "*", async () => {
    try {
      const noticeData = await fetchStudentNotices();
      setNotices(noticeData);
    } catch (err) {
      console.error(err);
    }
  });

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      const fileName = uploadedFile ? uploadedFile.name : `Aarav_Sharma_${selectedTask.subject.split(" ")[0]}_Solution.pdf`;
      await submitHomeworkSolution({
        homeworkId: selectedTask.id,
        fileName,
        notes,
      });
      setHomework((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id
            ? {
                ...t,
                status: "SUBMITTED",
                cutoffCountdown: "Submitted on time",
                submittedFileName: fileName,
                submissionDate: new Date().toISOString().split("T")[0],
              }
            : t
        )
      );
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(false);
        setSelectedTask(null);
        setUploadedFile(null);
        setNotes("");
      }, 1400);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleDownloadWorksheet = (task: StudentHomeworkTask) => {
    const safeTitle = task.subject.replace(/[^a-zA-Z0-9]/g, "_");
    setPreviewDoc({
      isOpen: true,
      title: `${task.subject} Assignment Worksheet`,
      fileName: `${safeTitle}_Worksheet_Question_Paper.pdf`,
      content: `=== AGRAGATI SCHOOL OS • ASSIGNMENT WORKSHEET ===\n\nSubject: ${task.subject}\nTopic: ${task.title}\nAssigned by: ${task.teacherName}\nDue Date: ${task.dueDate}\nTotal Marks: ${task.maxScore}\n\nInstructions & Rubric:\n${task.rubricSummary}\n\n1. Solve all problem derivations clearly.\n2. Submit compiled PDF script before the cutoff deadline.\n\nDean of Academics • Agragati Academy`,
      studentMeta: {
        name: profile?.name || "Aarav Sharma",
        classSection: profile?.form || "Class 12-A",
        rollNumber: "ADM-2024-001",
        academicSession: "2024-2025",
        institutionName: "AGRAGATI MODERN ACADEMY (CBSE AFFILIATED)",
      },
    });
  };

  const handleDownloadNotice = (notice: StudentBulletinItem) => {
    const safeTitle = notice.title.replace(/[^a-zA-Z0-9]/g, "_");
    setPreviewDoc({
      isOpen: true,
      title: "School Notice & Circular",
      fileName: `${safeTitle}_Circular.pdf`,
      content: `=== OFFICIAL CIRCULAR • AGRAGATI ACADEMY ===\nTitle: ${notice.title}\nCategory: ${notice.category}\nDate: ${notice.date}\nAuthor: ${notice.author}\n\nSummary:\n${notice.summary}\n\nNotice Content:\n${notice.body}\n\nDean of Academics & Student Welfare`,
      studentMeta: {
        name: profile?.name || "Aarav Sharma",
        classSection: profile?.form || "Class 12-A",
        rollNumber: "ADM-2024-001",
        academicSession: "2024-2025",
        institutionName: "AGRAGATI MODERN ACADEMY (CBSE AFFILIATED)",
      },
    });
  };

  return (
    <AppShell
      role="STUDENT"
      userName={profile?.name || "Aarav Sharma"}
      userRoleTitle={`Student • ${profile?.form || "Class 12-A"} • ${profile?.house || "Tagore House"}`}
      epochText="Academic Year 2024–2025 • Term 2 (CBSE Board)"
    >
      <div className="space-y-6">
        {/* Scholar Header Hero Welcome Banner */}
        <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 md:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Avatar + Greeting + Meta */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-100 to-amber-50 dark:from-amber-950/60 dark:to-amber-900/30 border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center font-serif font-bold text-xl text-amber-900 dark:text-amber-200 shrink-0 shadow-xs">
              {profile?.avatar || "AS"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                  Good morning, {profile?.name?.split(" ")[0] || "Aarav"}! ☀️
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-amber-950/50 text-[#92400E] dark:text-amber-300 border border-amber-200/70 dark:border-amber-800 font-sans text-[10px] font-bold uppercase tracking-wider">
                  HEAD BOY NOMINEE
                </span>
              </div>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-1">
                {profile?.grade || "Class 12 (CBSE Science & AI)"} • {profile?.house || "Tagore House"} • Roll No: {profile?.rollNumber || "ADM-2024-001"}
              </p>
            </div>
          </div>

          {/* Right: House Championship Points + Motto */}
          <div className="flex items-center gap-4 divide-x divide-stone-200/80 dark:divide-stone-800 shrink-0 self-start lg:self-center">
            <div className="flex items-center gap-3 pr-2">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 fill-amber-500 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#8C6D27] dark:text-amber-400 block font-sans">
                  HOUSE CHAMPIONSHIP
                </span>
                <span className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                  {profile?.housePoints || 142} Points
                </span>
              </div>
            </div>

            <div className="pl-4 hidden sm:block">
              <p className="font-serif italic text-xs text-stone-600 dark:text-stone-300 max-w-[150px] leading-relaxed">
                &ldquo;Discipline today builds a brighter tomorrow.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* 4 Scholar KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Attendance Rate */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 border-l-4 border-l-emerald-500 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                  ATTENDANCE RATE
                </span>
                <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {profile?.attendanceRate || "99.2%"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <span className="font-sans text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                {profile?.consecutiveStreakDays || 24}-Day Streak
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800 text-[9px] font-bold uppercase tracking-wider">
                PRESENT
              </span>
            </div>
          </div>

          {/* 2. CBSE Marks / Standing */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 border-l-4 border-l-amber-500 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                  OVERALL MARKS
                </span>
                <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {profile?.termGpa ? profile.termGpa.split(" ")[0] : "98.4%"}
                </span>
              </div>
            </div>
            <div className="mt-1">
              <span className="font-sans text-xs text-stone-500 dark:text-stone-400 block">
                Pre-Board Exam Rank 1 Nominee
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[9px] font-bold uppercase">
                TOP 1%
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-[9px] font-bold uppercase">
                ALL-INDIA
              </span>
            </div>
          </div>

          {/* 3. Active Assignments */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 border-l-4 border-l-rose-500 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                  PENDING HOMEWORK
                </span>
                <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {homework.filter((h) => h.status === "PENDING").length} Due
                </span>
              </div>
            </div>
            <div className="mt-1">
              <span className="font-sans text-xs text-stone-500 dark:text-stone-400 block truncate">
                Next: Math (Vectors &amp; 3D)
              </span>
            </div>
            <div className="flex justify-end mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <Link
                href="/student/homework"
                className="px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold transition-colors flex items-center gap-1"
              >
                Submit Script
              </Link>
            </div>
          </div>

          {/* 4. Campus Gate Curfew */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 border-l-4 border-l-purple-500 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                  HOSTEL GATE TIMING
                </span>
                <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  21:00 IST
                </span>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
              <MapPin className="w-3 h-3 text-stone-400" />
              <span>Smart RFID Gate 01</span>
            </div>
            <div className="flex justify-end mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <Link
                href="/student/attendance"
                className="px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-[#8C6D27] dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold transition-colors flex items-center gap-1"
              >
                Request Pass
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Column Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Lectures Timeline & Active Homework */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Academic Lectures & Labs Card */}
            <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 md:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100">
                      Today&apos;s Class Schedule &amp; Labs
                    </h3>
                    <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Term 2 (CBSE) • Tuesday
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800 text-[10px] font-bold uppercase tracking-wider self-start sm:self-center">
                  ONGOING: PERIOD 2
                </span>
              </div>

              {/* Vertical Timeline */}
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-stone-200 dark:bg-stone-800" />

                {schedule.map((sess, idx) => {
                  const isCompleted = sess.status === "COMPLETED";
                  const isActive = sess.status === "ACTIVE";
                  return (
                    <div key={sess.id} className="relative flex items-start gap-4">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-[18px] top-3 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#151922] shadow-xs ${
                          isCompleted
                            ? "bg-emerald-500 text-white"
                            : isActive
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 text-stone-400"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : isActive ? (
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
                        )}
                      </div>

                      <div className="w-24 shrink-0 font-sans text-xs font-semibold text-stone-700 dark:text-stone-300 pt-2.5">
                        {sess.time}
                      </div>

                      <div
                        className={`flex-1 rounded-xl p-3.5 shadow-xs border ${
                          isCompleted
                            ? "bg-white dark:bg-stone-900/30 border-stone-200/80 dark:border-stone-800 border-l-4 border-l-emerald-500"
                            : isActive
                            ? "bg-sky-50/40 dark:bg-sky-950/20 border-blue-200/80 dark:border-blue-800 border-l-4 border-l-blue-600"
                            : "bg-white dark:bg-stone-900/20 border-stone-200/80 dark:border-stone-800 border-l-4 border-l-stone-300 dark:border-l-stone-700"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                            {sess.subject}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded font-sans text-[9px] font-bold uppercase ${
                              isCompleted
                                ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"
                                : isActive
                                ? "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300"
                                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                            }`}
                          >
                            {sess.status}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-1">
                          {sess.teacher} • {sess.room}
                        </p>
                        <p className="font-sans text-xs text-stone-700 dark:text-stone-300 font-medium mt-1">
                          Topic: {sess.topic}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Problem Sets & Coursework Card */}
            <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 md:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#8C6D27] flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100">
                      Pending Homework &amp; Assignments
                    </h3>
                    <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Assignments requiring solution script submissions
                    </p>
                  </div>
                </div>
                <Link
                  href="/student/homework"
                  className="font-sans text-xs font-semibold text-[#8C6D27] dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>All Homework</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Task Items */}
              <div className="space-y-3">
                {homework.slice(0, 2).map((hw) => (
                  <div
                    key={hw.id}
                    className="p-4 rounded-xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-sans text-[10px] font-bold">
                          {hw.subject}
                        </span>
                        <span className="font-sans text-xs font-semibold text-rose-600 dark:text-rose-400">
                          {hw.cutoffCountdown}
                        </span>
                      </div>
                      <h4 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                        {hw.title}
                      </h4>
                      <p className="font-sans text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                        {hw.rubricSummary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleDownloadWorksheet(hw)}
                        title="Download Question Paper"
                        className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#8C6D27]" />
                        <span>Worksheet (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedTask(hw)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#8C6D27] hover:bg-[#785c1f] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit Script</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Tagore House & Circulars */}
          <div className="space-y-6">
            {/* Tagore House Card */}
            <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-[#8C6D27] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                    Tagore House
                  </h3>
                </div>
              </div>

              {/* Key Values */}
              <div className="space-y-2.5 text-xs font-sans">
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <UserCheck className="w-4 h-4 text-stone-400" />
                    <span>Housemaster</span>
                  </div>
                  <span className="font-bold text-stone-900 dark:text-stone-100">Prof. Rajesh Verma</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <Trophy className="w-4 h-4 text-stone-400" />
                    <span>Gate Access Status</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800 font-bold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 fill-emerald-600 text-white" />
                    Checked-in (Gate 01)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <CalendarDays className="w-4 h-4 text-stone-400" />
                    <span>House Merit Points</span>
                  </div>
                  <span className="font-bold text-[#8C6D27] dark:text-amber-400">+142 pts (Rank #2)</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <Clock className="w-4 h-4 text-stone-400" />
                    <span>Next Assembly</span>
                  </div>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">Friday 14:30 IST</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                <Link href="/student/attendance" className="w-full">
                  <button className="w-full py-2.5 px-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-[#8C6D27] dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
                    <CalendarDays className="w-3.5 h-3.5 text-[#8C6D27]" />
                    <span>Request Campus Leave / Exeat Pass</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Circulars & Notices Card */}
            <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-[#8C6D27] flex items-center justify-center shrink-0">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                    School Circulars &amp; Notices
                  </h3>
                </div>
                <Link
                  href="/student/notices"
                  className="font-sans text-xs font-semibold text-[#8C6D27] dark:text-amber-400 hover:underline flex items-center gap-0.5"
                >
                  <span>All</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Feed Items */}
              <div className="space-y-3 font-sans">
                {notices.slice(0, 2).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNotice(n)}
                    className="block p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 border border-stone-200/60 dark:border-stone-800 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-[9px] font-bold uppercase">
                        {n.category}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {n.date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-xs leading-snug group-hover:text-[#8C6D27]">
                        {n.title}
                      </h5>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0 group-hover:text-[#8C6D27]" />
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                      {n.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Motivational Banner */}
        <div className="bg-white dark:bg-[#151922] rounded-2xl border border-amber-200/70 dark:border-amber-900/40 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-[#8C6D27] flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                Keep Learning. Keep Growing!
              </h3>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Every small step brings you closer to your dreams.
              </p>
            </div>
          </div>

          <div className="relative z-10 text-right">
            <p className="font-serif italic text-sm text-stone-700 dark:text-stone-300">
              &ldquo;A focused mind creates endless possibilities.&rdquo;
            </p>
            <div className="w-12 h-1 bg-[#8C6D27] rounded-full mt-2 ml-auto" />
          </div>
        </div>

        {/* Quick Submit Script Modal */}
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title="Submit Homework Script"
          description={selectedTask ? `${selectedTask.subject} • ${selectedTask.title}` : ""}
          maxWidth="lg"
        >
          {selectedTask && (
            <div className="space-y-4 font-sans text-xs">
              {submitSuccess ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                    Script Submitted Successfully!
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Your solution has been timestamped and delivered to {selectedTask.teacherName} for evaluation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleQuickSubmit} className="space-y-4">
                  <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-stone-900 dark:text-stone-100">{selectedTask.title}</span>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold font-mono">{selectedTask.cutoffCountdown}</span>
                    </div>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{selectedTask.rubricSummary}</p>
                  </div>

                  {/* Real File Input Drag & Drop Box */}
                  <div>
                    <label className="block font-semibold text-stone-900 dark:text-stone-100 mb-1">
                      Upload Solution PDF / Document
                    </label>
                    <label className="p-5 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20 text-center space-y-2 block cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setUploadedFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-[#8C6D27] mx-auto" />
                      <div>
                        <span className="font-bold text-xs text-stone-900 dark:text-stone-100 block font-mono">
                          {uploadedFile ? uploadedFile.name : `Aarav_Sharma_${selectedTask.subject.split(" ")[0]}_Solution.pdf`}
                        </span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">
                          {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB • Click to change file` : "Click or drag & drop to choose your completed PDF script"}
                        </span>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-900 dark:text-stone-100 mb-1">
                      Notes for Teacher (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add any problem notes, references, or assumptions made..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:bg-white dark:focus:bg-stone-800 focus:ring-1 focus:ring-amber-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => setSelectedTask(null)}
                      className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl bg-[#8C6D27] hover:bg-[#785c1f] text-white font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? "Uploading Script..." : "Submit for Evaluation"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </Modal>

        {/* Notice View Modal */}
        <Modal
          isOpen={!!selectedNotice}
          onClose={() => setSelectedNotice(null)}
          title="School Notice & Circular"
          description={selectedNotice ? `${selectedNotice.category} • ${selectedNotice.date}` : ""}
          maxWidth="md"
        >
          {selectedNotice && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                  {selectedNotice.title}
                </h4>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                  {selectedNotice.body}
                </p>
                <div className="pt-2 text-[11px] text-stone-400">
                  Posted by: <strong>{selectedNotice.author}</strong>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => handleDownloadNotice(selectedNotice)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#8C6D27]" />
                  <span>Download Circular (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedNotice(null)}
                  className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold"
                >
                  Close
                </button>
              </div>
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
