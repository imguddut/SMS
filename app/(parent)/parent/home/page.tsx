"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Modal } from "@/components/ui/modal";
import {
  fetchEnrolledWards,
  fetchParentDigest,
  fetchWardHomework,
  fetchParentBulletins,
  submitAbsenceExcuse,
  signNoticeConsent,
  ParentWardProfile,
  ParentDigestStats,
  WardHomeworkItem,
  ParentNoticeItem,
} from "@/lib/db/parent";
import {
  GraduationCap,
  Calendar,
  CalendarDays,
  Receipt,
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
  Phone,
  FileText,
  ChevronRight,
  BarChart3,
  CreditCard,
  Send,
  Sparkles,
  Check,
  AlertTriangle,
  Download,
  Printer,
  Eye,
} from "lucide-react";
import { PdfPreviewModal } from "@/components/ui/pdf-preview-modal";
import { useRealtimeEvent } from "@/components/providers/realtime-provider";

export default function ParentHomePage() {
  const [wards, setWards] = React.useState<ParentWardProfile[]>([]);
  const [selectedWardId, setSelectedWardId] = React.useState<string>("ward-01");
  const [digest, setDigest] = React.useState<ParentDigestStats | null>(null);
  const [homework, setHomework] = React.useState<WardHomeworkItem[]>([]);
  const [bulletins, setBulletins] = React.useState<ParentNoticeItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [previewDoc, setPreviewDoc] = React.useState<{
    isOpen: boolean;
    title: string;
    fileName: string;
    content: string;
    studentMeta?: { name?: string; form?: string; rollNumber?: string; house?: string };
  } | null>(null);

  // Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = React.useState(false);
  const [isSubmittingLeave, setIsSubmittingLeave] = React.useState(false);
  const [leaveSuccess, setLeaveSuccess] = React.useState(false);
  const [leaveData, setLeaveData] = React.useState({
    startDate: "2025-01-20",
    endDate: "2025-01-21",
    reason: "Family function • Prior leave note submitted.",
  });

  // Consent Modal State
  const [isConsentModalOpen, setIsConsentModalOpen] = React.useState(false);
  const [isSigningConsent, setIsSigningConsent] = React.useState(false);
  const [consentSuccess, setConsentSuccess] = React.useState(false);
  const [consentAcknowledged, setConsentAcknowledged] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      try {
        const wardsData = await fetchEnrolledWards();
        setWards(wardsData);
        if (wardsData.length > 0) {
          const activeId = selectedWardId || wardsData[0].id;
          const [digestData, hwData, noticesData] = await Promise.all([
            fetchParentDigest(activeId),
            fetchWardHomework(activeId),
            fetchParentBulletins(),
          ]);
          setDigest(digestData);
          setHomework(hwData);
          setBulletins(noticesData);
        }
      } catch (err) {
        console.error("Failed to load parent portal digest", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedWardId]);

  const refreshWardData = React.useCallback(async () => {
    if (!selectedWardId) return;
    try {
      const [digestData, hwData, bullData] = await Promise.all([
        fetchParentDigest(selectedWardId),
        fetchWardHomework(selectedWardId),
        fetchParentBulletins(),
      ]);
      setDigest(digestData);
      setHomework(hwData);
      setBulletins(bullData);
    } catch (err) {
      console.error("Realtime refresh error:", err);
    }
  }, [selectedWardId]);

  useRealtimeEvent("attendance_records", "*", refreshWardData);
  useRealtimeEvent("homework_assignments", "*", refreshWardData);
  useRealtimeEvent("invoices", "*", refreshWardData);
  useRealtimeEvent("notices", "*", refreshWardData);

  const activeWard = wards.find((w) => w.id === selectedWardId) || wards[0];

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLeave(true);
    try {
      await submitAbsenceExcuse({
        wardId: selectedWardId,
        date: leaveData.startDate,
        reason: leaveData.reason,
        doctorCertificateAttached: false,
      });
      setLeaveSuccess(true);
      setTimeout(() => {
        setIsLeaveModalOpen(false);
        setLeaveSuccess(false);
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  const handleDownloadLeaveReceipt = () => {
    const studentName = activeWard?.name || "Aarav Sharma";
    const studentForm = activeWard?.form || "Class 12-A";
    const studentRoll = activeWard?.rollNumber || "ADM-2024-001";
    const studentHouse = activeWard?.house || "Tagore House";

    const content = `OFFICIAL PARENTAL ABSENCE EXCUSE & LEAVE SLIP
Application Reference: LEAVE-REC-${Date.now().toString().slice(-6)}
Submission Date: ${new Date().toLocaleDateString("en-IN")}
Status: SUBMITTED (Pending Class Teacher Approval)

STUDENT DETAILS:
Name: ${studentName}
Class & Section: ${studentForm}
Admission / Roll No: ${studentRoll}
House: ${studentHouse}
Parent / Guardian: Mr. Rajesh Sharma

LEAVE APPLICATION PARTICULARS:
Start Date: ${leaveData.startDate}
End Date: ${leaveData.endDate}
Reason for Absence: ${leaveData.reason}
Doctor Certificate: Not Required / Standard Parental Leave Note

CLASS TEACHER & ACADEMIC ROUTING:
Class Teacher: Prof. Rajesh Verma (Senior PGT)
Housemaster: Prof. Rajesh Verma (Tagore House)
Attendance Status: Recorded in School ERP Portal

This document serves as proof of electronic leave submission by registered parent/guardian Mr. Rajesh Sharma via Agragati School OS.`;

    setPreviewDoc({
      isOpen: true,
      title: "Parental Leave Application Slip",
      fileName: `Leave_Slip_${studentName.replace(/\s+/g, "_")}.pdf`,
      content,
      studentMeta: {
        name: studentName,
        form: studentForm,
        rollNumber: studentRoll,
        house: studentHouse,
      },
    });
  };

  const handleConsentSign = async () => {
    if (!consentAcknowledged) return;
    setIsSigningConsent(true);
    try {
      await signNoticeConsent("not-01");
      setConsentSuccess(true);
      setTimeout(() => {
        setIsConsentModalOpen(false);
        setConsentSuccess(false);
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigningConsent(false);
    }
  };

  const handleDownloadConsentForm = () => {
    const studentName = activeWard?.name || "Aarav Sharma";
    const studentForm = activeWard?.form || "Class 12-A";
    const studentRoll = activeWard?.rollNumber || "ADM-2024-001";
    const studentHouse = activeWard?.house || "Tagore House";

    const content = `OFFICIAL PARENTAL PERMISSION & CONSENT SLIP
Activity: Educational Visit to ISRO Space Applications Centre
Dates: February 12 to 15, 2025
Tour Coordinator: Dr. K. Radhakrishnan (HOD Science)

STUDENT PARTICULARS:
Student Name: ${studentName}
Class & Section: ${studentForm}
Admission Roll No: ${studentRoll}
House: ${studentHouse}

PARENT / GUARDIAN ACKNOWLEDGEMENT:
Parent Name: Mr. Rajesh Sharma
Registered Contact: +91 98100 54321
Consent Status: GRANTED & DIGITALLY VERIFIED
Declaration: I hereby confirm that I have reviewed the tour schedule, itinerary, and safety regulations. I give full consent for my ward ${studentName} to participate in the educational tour under the supervision of authorized school faculty.

Institutional Verification: SEAL-APAAR-CBSE-TOUR-2025`;

    setPreviewDoc({
      isOpen: true,
      title: "ISRO Study Tour Parental Consent Form",
      fileName: `Parent_Consent_ISRO_Tour_${studentName.replace(/\s+/g, "_")}.pdf`,
      content,
      studentMeta: {
        name: studentName,
        form: studentForm,
        rollNumber: studentRoll,
        house: studentHouse,
      },
    });
  };

  const handleDownloadHomeworkTask = (taskTitle: string, subject: string, teacher: string, due: string, maxMarks: number) => {
    const studentName = activeWard?.name || "Aarav Sharma";
    const studentForm = activeWard?.form || "Class 12-A";
    const studentRoll = activeWard?.rollNumber || "ADM-2024-001";
    const studentHouse = activeWard?.house || "Tagore House";

    const content = `OFFICIAL HOMEWORK WORKSHEET & INSTRUCTIONS
Subject: ${subject}
Topic: ${taskTitle}
Assigned By: ${teacher}
Submission Due Date: ${due}
Total Marks: ${maxMarks}

STUDENT DETAILS:
Name: ${studentName}
Class: ${studentForm}
Roll No: ${studentRoll}
House: ${studentHouse}

ASSIGNMENT INSTRUCTIONS & GUIDELINES:
1. Complete all numerical and theoretical problem sets in the designated homework register.
2. Provide step-by-step vector algebra derivations and diagrams where specified.
3. Reference NCERT Class 12 Exemplar problems for supplementary practice.
4. Submit the completed physical register or upload PDF scan by 04:00 PM on ${due}.

Evaluation Criteria: Conceptual clarity (40%), Formula accuracy (30%), Neatness & steps (30%).`;

    setPreviewDoc({
      isOpen: true,
      title: `Assignment Worksheet • ${subject}`,
      fileName: `Homework_${subject.replace(/[^a-zA-Z0-9]/g, "_")}_${studentName.replace(/\s+/g, "_")}.pdf`,
      content,
      studentMeta: {
        name: studentName,
        form: studentForm,
        rollNumber: studentRoll,
        house: studentHouse,
      },
    });
  };

  return (
    <AppShell
      role="PARENT"
      userName="Mr. Rajesh Sharma"
      userRoleTitle={`Parent • ${activeWard ? activeWard.name : "Aarav Sharma"}`}
      epochText="Academic Year 2024–2025 • Term 2 (CBSE Board)"
    >
      <div className="space-y-6">
        {/* Child Profile Switcher Hero Card */}
        <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 md:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Student Details */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-100 to-amber-50 dark:from-amber-950/60 dark:to-amber-900/30 border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center font-serif font-bold text-2xl text-amber-900 dark:text-amber-200 shrink-0 shadow-xs overflow-hidden">
                <svg className="w-12 h-12 text-stone-700 dark:text-stone-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                  {activeWard?.name || "Aarav Sharma"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EEF2FF] dark:bg-indigo-950/50 text-[#3730A3] dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50 font-sans text-[10px] font-bold uppercase tracking-wider">
                  {activeWard?.form || "CLASS 12-A"}
                </span>
              </div>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-1">
                {activeWard?.grade || "Class 12 (CBSE Science & AI)"} • {activeWard?.house || "Tagore House"} • Roll No: {activeWard?.rollNumber || "ADM-2024-001"}
              </p>
            </div>
          </div>

          {/* Middle & Right: Student Switcher Buttons + Motto */}
          <div className="flex flex-wrap items-center gap-4 shrink-0 self-start lg:self-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium hidden sm:inline">
                Select Child:
              </span>
              <div className="flex items-center gap-2">
                {wards.map((w) => {
                  const isActive = w.id === selectedWardId;
                  return (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWardId(w.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                          : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800"
                      }`}
                    >
                      {w.name.split(" ")[0]} ({w.form})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hidden xl:block pl-2 border-l border-stone-200/80 dark:border-stone-800">
              <div className="bg-[#FFFBEB] dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 rounded-2xl p-3 max-w-[190px]">
                <p className="font-serif italic text-xs text-amber-900 dark:text-amber-200 leading-snug">
                  &ldquo;Hard work today builds a brighter tomorrow.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Attendance Rate */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-sans">
                    ATTENDANCE
                  </span>
                  <span className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
                    {digest?.attendanceRate || "99.2%"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {digest?.todaysArrivalStatus || "Present in School"}
              </span>
              <span className="text-[11px] text-stone-400 font-medium">08:08 AM</span>
            </div>
          </div>

          {/* 2. Academic Marks */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-sans">
                    OVERALL MARKS
                  </span>
                  <span className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
                    {activeWard?.termGpa ? activeWard.termGpa.split(" ")[0] : "98.4%"}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs font-semibold text-amber-900 dark:text-amber-300 block">
                Rank 1 in Class
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block mt-0.5">
                Pre-Board Exam Aggregate
              </span>
            </div>
          </div>

          {/* 3. Fee Status */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-sans">
                    FEE BALANCE
                  </span>
                  <span className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
                    ₹ 0 Due
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-[140px]">
                Term 2 Fees Cleared
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider shrink-0">
                PAID
              </span>
            </div>
          </div>

          {/* 4. Homework & Tasks */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-sans">
                    PENDING HOMEWORK
                  </span>
                  <span className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
                    {digest?.pendingHomeworkCount || 2} Tasks
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800">
              <span className="text-xs text-stone-500 dark:text-stone-400">Due this week</span>
              <Link
                href="/parent/homework"
                className="px-3 py-1 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200/80 dark:border-rose-800 transition-colors"
              >
                View Tasks
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Schedule & Active Homework */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Class Schedule */}
            <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 leading-tight">
                      Today&apos;s Class Schedule
                    </h2>
                    <span className="font-sans text-xs text-stone-500 dark:text-stone-400">
                      Term 2 (CBSE) • Tuesday
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-ping" />
                  ONGOING: PERIOD 2
                </span>
              </div>

              {/* Schedule Timeline Items */}
              <div className="mt-4 space-y-3 relative before:absolute before:left-[108px] before:top-4 before:bottom-4 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800 hidden sm:block">
                {/* Period 1: Completed */}
                <div className="relative flex items-center justify-between p-3 rounded-xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800 border-l-4 border-l-emerald-500 hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-6 min-w-0">
                    <div className="flex items-center gap-2.5 w-24 shrink-0">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] z-10 shadow-xs">
                        ✓
                      </div>
                      <span className="font-sans text-xs font-bold text-stone-800 dark:text-stone-200">
                        08:30 – 10:00
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">
                        Mathematics (CBSE 041 - Vector Algebra)
                      </h4>
                      <p className="font-sans text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                        Prof. Rajesh Verma • Room 301
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold uppercase tracking-wider shrink-0">
                    COMPLETED
                  </span>
                </div>

                {/* Period 2: In Progress */}
                <div className="relative flex items-center justify-between p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-800/40 border-l-4 border-l-sky-500 hover:bg-sky-50 transition-colors">
                  <div className="flex items-center gap-6 min-w-0">
                    <div className="flex items-center gap-2.5 w-24 shrink-0">
                      <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] z-10 ring-4 ring-sky-100 dark:ring-sky-900/40 shadow-xs">
                        ●
                      </div>
                      <span className="font-sans text-xs font-bold text-stone-800 dark:text-stone-200">
                        10:15 – 11:45
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">
                        Physics (CBSE 042 - Lab Practical)
                      </h4>
                      <p className="font-sans text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                        Mrs. Sunita Deshmukh • Physics Lab 304
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[10px] font-bold uppercase tracking-wider shrink-0">
                    ONGOING
                  </span>
                </div>

                {/* Period 3: Upcoming */}
                <div className="relative flex items-center justify-between p-3 rounded-xl bg-white dark:bg-stone-900/20 border border-stone-200/70 dark:border-stone-800 border-l-4 border-l-stone-300 hover:bg-stone-50/50 transition-colors">
                  <div className="flex items-center gap-6 min-w-0">
                    <div className="flex items-center gap-2.5 w-24 shrink-0">
                      <div className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-500 flex items-center justify-center text-[10px] z-10">
                        ○
                      </div>
                      <span className="font-sans text-xs font-semibold text-stone-600 dark:text-stone-400">
                        13:00 – 14:00
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">
                        Computer Science (Python &amp; SQL Lab)
                      </h4>
                      <p className="font-sans text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                        Mr. Anand Sen • Computer Lab 2
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[10px] font-bold uppercase tracking-wider shrink-0">
                    UPCOMING
                  </span>
                </div>

                {/* Period 4: Upcoming */}
                <div className="relative flex items-center justify-between p-3 rounded-xl bg-white dark:bg-stone-900/20 border border-stone-200/70 dark:border-stone-800 border-l-4 border-l-stone-300 hover:bg-stone-50/50 transition-colors">
                  <div className="flex items-center gap-6 min-w-0">
                    <div className="flex items-center gap-2.5 w-24 shrink-0">
                      <div className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-500 flex items-center justify-center text-[10px] z-10">
                        ○
                      </div>
                      <span className="font-sans text-xs font-semibold text-stone-600 dark:text-stone-400">
                        14:15 – 15:45
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">
                        English Core &amp; Reading Comprehension
                      </h4>
                      <p className="font-sans text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                        Mrs. Priya Nair • Room 102
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[10px] font-bold uppercase tracking-wider shrink-0">
                    UPCOMING
                  </span>
                </div>
              </div>
            </div>

            {/* Active Homework */}
            <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 leading-tight">
                      Pending Homework &amp; Assignments
                    </h2>
                    <span className="font-sans text-xs text-stone-500 dark:text-stone-400">
                      Assigned to {activeWard?.name.split(" ")[0] || "Aarav"}
                    </span>
                  </div>
                </div>
                <Link
                  href="/parent/homework"
                  className="font-sans text-xs font-semibold text-[#8C6D27] dark:text-amber-400 hover:underline flex items-center gap-1 transition-colors"
                >
                  View All Homework <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Homework List Cards */}
              <div className="mt-4 space-y-3">
                {/* Task 1: Mathematics */}
                <div className="p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 hover:border-amber-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800 flex items-center justify-center font-serif font-bold text-lg shrink-0 mt-0.5">
                      Σ
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-purple-100/80 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 text-[9px] font-bold uppercase tracking-wider">
                          MATHEMATICS (CBSE 041)
                        </span>
                        <span className="text-stone-400 text-xs">•</span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                          By Prof. Rajesh Verma
                        </span>
                      </div>
                      <h4 className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100 leading-snug">
                        Problem Set 5: Three-Dimensional Geometry &amp; Vector Algebra
                      </h4>
                      <p className="font-sans text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        Shortest distance between skew lines and plane equations in vector form...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100 dark:border-stone-800">
                    <div className="flex flex-col md:items-end">
                      <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold flex items-center gap-1">
                        📅 Due: 27 Jan 2025
                      </span>
                      <span className="text-[10px] text-stone-400 mt-0.5">
                        Total Marks: 50
                      </span>
                    </div>
                    <Link
                      href="/parent/homework"
                      className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Task 2: Physics */}
                <div className="p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 hover:border-amber-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-800 flex items-center justify-center font-serif font-bold text-lg shrink-0 mt-0.5">
                      ⚛
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-rose-100/80 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 text-[9px] font-bold uppercase tracking-wider">
                          PHYSICS (CBSE 042)
                        </span>
                        <span className="text-stone-400 text-xs">•</span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                          By Mrs. Sunita Deshmukh
                        </span>
                      </div>
                      <h4 className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100 leading-snug">
                        CBSE Investigatory Project: Electromagnetic Induction
                      </h4>
                      <p className="font-sans text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        Transformer working model and self/mutual induction project report...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100 dark:border-stone-800">
                    <div className="flex flex-col md:items-end">
                      <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold flex items-center gap-1">
                        📅 Due: 28 Jan 2025
                      </span>
                      <span className="text-[10px] text-stone-400 mt-0.5">
                        Total Marks: 30
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDownloadHomeworkTask("CBSE Investigatory Project: Electromagnetic Induction", "Physics (CBSE 042)", "Mrs. Sunita Deshmukh", "28 Jan 2025", 30)}
                        title="Download Assignment Worksheet (PDF)"
                        className="p-1.5 rounded-lg text-[#8C6D27] dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <Link
                        href="/parent/homework"
                        className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Teacher Contact & Parent Permission */}
          <div className="space-y-6">
            {/* Class Teacher Contact Card */}
            <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#8C6D27] border border-amber-100 dark:border-amber-800 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">
                    Class Teacher &amp; Support
                  </h2>
                  <p className="font-sans text-[11px] text-stone-500 dark:text-stone-400">
                    For any student queries or academic help.
                  </p>
                </div>
              </div>

              {/* Coordinator Card */}
              <div className="mt-4 p-3.5 rounded-xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/70 dark:border-stone-800 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-serif font-bold text-sm shrink-0 shadow-xs">
                  RV
                </div>
                <div className="min-w-0">
                  <span className="font-sans text-[9px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                    CLASS TEACHER &amp; SENIOR PGT
                  </span>
                  <h4 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 leading-tight truncate">
                    Prof. Rajesh Verma
                  </h4>
                  <p className="font-sans text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                    Timing: Mon–Sat, 8:00 AM – 4:30 PM
                  </p>
                </div>
              </div>

              {/* Helpline Contact Row */}
              <div className="mt-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-[#8C6D27] dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-sans text-[9px] font-bold text-[#8C6D27] dark:text-amber-400 uppercase tracking-widest block">
                    SCHOOL HELPLINE NUMBER
                  </span>
                  <span className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                    +91 11 2617 8812
                  </span>
                </div>
              </div>

              {/* Apply for Leave Button */}
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(true)}
                className="w-full mt-4 py-2.5 px-4 rounded-xl border border-amber-300/80 dark:border-amber-700 bg-white dark:bg-stone-900 hover:bg-amber-50/60 dark:hover:bg-amber-950/40 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <FileText className="w-4 h-4 text-[#8C6D27]" />
                <span>Apply for Leave</span>
              </button>
            </div>

            {/* Parent Permission Notice Box */}
            <div className="bg-[#FFFDF7] dark:bg-amber-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-800/50 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-[#FEF3C7] dark:bg-amber-950/50 text-[#92400E] dark:text-amber-300 font-sans text-[9px] font-bold uppercase tracking-wider">
                  PARENT PERMISSION REQUIRED
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 font-sans text-[9px] font-bold uppercase tracking-wider">
                  URGENT
                </span>
              </div>

              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                ISRO Space Applications Centre Study Tour
              </h3>

              <p className="font-sans text-xs text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed">
                Study tour for Class 11 &amp; 12 students. Please review the details and submit your consent slip.
              </p>

              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsConsentModalOpen(true)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#8C6D27] hover:bg-[#785c1f] text-white font-sans text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Review &amp; Sign Consent Slip</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadConsentForm}
                  title="Download Permission Form (PDF)"
                  className="p-2.5 rounded-xl border border-amber-300/80 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-[#8C6D27] dark:text-amber-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Banner */}
        <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4 z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#8C6D27] border border-amber-200/60 dark:border-amber-800 flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Supporting {activeWard?.name.split(" ")[0] || "Aarav"}&apos;s Learning Journey
              </h3>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Your daily support and encouragement make a big difference.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 z-10 self-end md:self-center">
            <div className="text-right">
              <p className="font-serif italic text-xs text-stone-600 dark:text-stone-300">
                &ldquo;Consistent effort every day leads to excellence.&rdquo;
              </p>
              <div className="w-8 h-0.5 bg-[#8C6D27] ml-auto mt-1 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Leave Application Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply for Leave"
        description={`Submit a leave application for ${activeWard?.name} (${activeWard?.form}).`}
        maxWidth="md"
      >
        <form onSubmit={handleLeaveSubmit} className="space-y-4 mt-2">
          {leaveSuccess ? (
            <div className="p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
              <p className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Leave Application Submitted!
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Class Teacher Prof. Rajesh Verma will review and update the attendance record.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDownloadLeaveReceipt}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8C6D27] text-white text-xs font-bold hover:bg-[#785c1f] transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Leave Slip (PDF)</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={leaveData.startDate}
                  onChange={(e) => setLeaveData({ ...leaveData, startDate: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={leaveData.endDate}
                  onChange={(e) => setLeaveData({ ...leaveData, endDate: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Reason for Leave
                </label>
                <textarea
                  rows={3}
                  value={leaveData.reason}
                  onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                  placeholder="Please state the reason for absence..."
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadLeaveReceipt}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#8C6D27] dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Draft Slip</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLeaveModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingLeave}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#8C6D27] hover:bg-[#785c1f] shadow-xs disabled:opacity-50"
                  >
                    {isSubmittingLeave ? "Submitting..." : "Submit Leave Application"}
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* Parental Consent Modal */}
      <Modal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        title="Parent Permission Form (Consent Slip)"
        description="ISRO Space Applications Centre Educational Tour"
        maxWidth="lg"
      >
        <div className="space-y-4 mt-2">
          {consentSuccess ? (
            <div className="p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
              <p className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Permission Slip Submitted Successfully!
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Your consent has been recorded with the School Administration.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDownloadConsentForm}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8C6D27] text-white text-xs font-bold hover:bg-[#785c1f] transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed Consent Slip (PDF)</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-stone-700 dark:text-stone-300 space-y-2 leading-relaxed font-sans">
                <p>
                  <strong>Activity:</strong> Educational Visit to ISRO Space Applications Centre
                </p>
                <p>
                  <strong>Dates:</strong> February 12 to 15, 2025
                </p>
                <p>
                  <strong>Accompanying Teachers:</strong> Dr. K. Radhakrishnan &amp; Science Department Faculty
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-amber-200 dark:border-amber-800">
                  By ticking the checkbox below, you grant permission for your child to participate in the educational visit.
                </p>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAcknowledged}
                  onChange={(e) => setConsentAcknowledged(e.target.checked)}
                  className="mt-0.5 rounded border-stone-300 text-[#8C6D27] focus:ring-[#8C6D27]"
                />
                <span className="text-xs text-stone-800 dark:text-stone-200 leading-snug">
                  I, <strong>Mr. Rajesh Sharma</strong>, confirm that I have read the tour guidelines and grant permission for my child ({activeWard?.name}).
                </span>
              </label>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadConsentForm}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#8C6D27] dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Information PDF</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConsentModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConsentSign}
                    disabled={!consentAcknowledged || isSigningConsent}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#8C6D27] hover:bg-[#785c1f] shadow-xs disabled:opacity-50"
                  >
                    {isSigningConsent ? "Submitting..." : "Submit Permission"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
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
    </AppShell>
  );
}
