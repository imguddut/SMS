"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  CheckCircle2,
  Clock,
  Building2,
  ShieldCheck,
  Save,
  Check,
  ArrowLeft,
  Users,
  AlertTriangle,
  FileText,
  Printer,
  Lock,
  Calendar,
  Shield,
  CheckCheck,
  Mail,
  X,
  GraduationCap,
} from "lucide-react";
import {
  fetchClassAttendanceRoster,
  submitAttendance,
  StudentAttendanceItem,
} from "@/lib/db/teacher";
import { PdfPreviewModal } from "@/components/ui/pdf-preview-modal";
import { TeacherQuoteBanner } from "@/components/ui/teacher-quote-banner";

export default function TeacherAttendancePage() {
  const [roster, setRoster] = React.useState<StudentAttendanceItem[]>([]);
  const [selectedClass, setSelectedClass] = React.useState("Form VI - Advanced Pure ...");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [sealedHash, setSealedHash] = React.useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      const data = await fetchClassAttendanceRoster();
      setRoster(data);
    }
    load();
  }, []);

  const handleStatusChange = (id: string, newStatus: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") => {
    setRoster((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleMarkAllPresent = () => {
    setRoster((prev) =>
      prev.map((item) => ({ ...item, status: "PRESENT" }))
    );
  };

  const handleCommitRegister = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitAttendance({
        classId: selectedClass,
        attendance: roster,
      });
      setSealedHash(res.hash);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const presentCount = roster.filter((r) => r.status === "PRESENT").length;
  const lateCount = roster.filter((r) => r.status === "LATE").length;
  const absentCount = roster.filter((r) => r.status === "ABSENT").length;
  const excusedCount = roster.filter((r) => r.status === "EXCUSED").length;

  const previewContent = `DELHI PUBLIC SCHOOL, R.K. PURAM
OFFICIAL CLASSROOM ATTENDANCE REGISTER & BIOMETRIC LOG
Academic Session: 2024–2025 • Michaelmas Term 3

CLASS & SESSION DETAILS:
Class & Section: Class 12-A — Form VI (Senior Lyceum)
Lecture Hall: Physics Wing Rm 301 • Session Period: Period 1 (08:30 – 10:00 IST)
Subject: Mathematics (041) — Vectors & 3D Geometry
Faculty In-Charge: Dr. Alistair Finch (Senior Master in Classical Humanities)
Date: Friday, 5 Sep 2026 • 08:30 CET Cutoff

SUMMARY COHORT STATISTICS:
Total Registered Scholars: ${roster.length} Scholars
Present & Verified: ${presentCount} Scholars
Late Arrivals: ${lateCount} Scholars
Excused / Medical Absences: ${excusedCount} Scholars
Unexcused Absences: ${absentCount} Scholars
Register Status: ${sealedHash ? `Sealed (${sealedHash})` : "Active Roll-Call in Progress"}

STUDENT-WISE ATTENDANCE LOG:
================================================================================
${roster
  .map(
    (s, idx) =>
      `${idx + 1}. SCHOLAR: ${s.studentName} (${s.studentId.toUpperCase()})
   House: ${s.house} • Form: ${s.form}
   Turnstile Sensor Log: ${s.turnstileTime}
   Attendance Status: ${s.status}${s.remarks ? `\n   Faculty Remarks: ${s.remarks}` : ""}`
  )
  .join("\n\n")}
================================================================================

STATUTORY CBSE ATTENDANCE DIRECTIVE:
As per CBSE Senior Secondary Examination By-laws, a minimum of 75% aggregate attendance is mandatory for board exam candidature.

Cryptographic Seal: ${sealedHash || "SEAL-ROLLCALL-DILITHIUM5-ACTIVE"}
Faculty Invigilator Signature: Dr. Alistair Finch (Senior Master)`;

  // Student Initials Color Mapping
  const avatarColors: Record<string, string> = {
    "std-01": "bg-blue-100 text-blue-700",
    "std-02": "bg-purple-100 text-purple-700",
    "std-03": "bg-indigo-100 text-indigo-700",
    "std-04": "bg-emerald-100 text-emerald-700",
    "std-05": "bg-rose-100 text-rose-700",
    "std-06": "bg-pink-100 text-pink-700",
  };

  const houseBadges: Record<string, string> = {
    "Tagore House": "bg-blue-100 text-blue-700",
    "Ashoka House": "bg-rose-100 text-rose-700",
    "Shivaji House": "bg-emerald-100 text-emerald-700",
    "Raman House": "bg-purple-100 text-purple-700",
  };

  return (
    <AppShell
      role="TEACHER"
      schoolName="The King's College & Academy"
      campusName="GENEVA CAMPUS"
      userName="Dr. Alistair Finch"
      userRoleTitle="Senior Master in Classical Humanities"
      epochText="Daily Schedule • Michaelmas Term 3 • 5 Sep 2026"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header Section matching Image 3 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                ROLL-CALL SESSION ACTIVE • Turnstile Edge Gates Synchronized • 08:30 CET Cutoff
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#0F172A] dark:text-stone-100">
              Session Attendance Marking
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#64748B] dark:text-stone-400 mt-1 max-w-2xl">
              Verify biometric turnstile check-ins, record punctuality exceptions, and commit the cryptographically signed roll-call ledger.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Safe Campus Graphic Badge */}
            <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-200 dark:bg-blue-900/80 flex items-center justify-center text-blue-800 dark:text-blue-200 shrink-0 text-sm">
                🚪
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold text-blue-900 dark:text-blue-200">Safe Campus</span>
                <span className="text-[9px] text-blue-700 dark:text-blue-300">Bright Futures</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              className="text-xs gap-1.5 text-slate-700 hover:text-slate-900 shadow-xs"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              Register (PDF)
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllPresent}
              className="font-sans text-xs font-semibold gap-1.5 shadow-xs"
            >
              <Users className="w-4 h-4" />
              Mark All Present
            </Button>

            <Button
              size="sm"
              disabled={isSubmitting || !!sealedHash}
              onClick={handleCommitRegister}
              className="bg-[#0A369D] hover:bg-[#082975] text-white text-xs font-semibold gap-1.5 shadow-xs"
            >
              {sealedHash ? (
                <>
                  <Check className="w-4 h-4 text-white" /> Register Sealed
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-white" />
                  {isSubmitting ? "Sealing..." : "Commit Sealed Register"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Pdf Preview Modal */}
        <PdfPreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title="Classroom Attendance Register"
          fileName="Class_12A_Attendance_Register_Session1.pdf"
          content={previewContent}
          studentMeta={{
            name: "Class 12-A Roster",
            rollNumber: "38 Enrolled Scholars",
            form: "Class 12-A (Senior Secondary)",
            house: "Senior Lyceum Section",
            institutionName: "DELHI PUBLIC SCHOOL, R.K. PURAM",
            institutionAffiliation: "Affiliated to Central Board of Secondary Education (CBSE) • Affiliation No: 2730017",
            institutionAddress: "Sector XII, R.K. Puram, New Delhi - 110022 • School Code: 85214",
            academicSession: "2024–2025",
          }}
        />

        {/* 4 Metric Cards matching Image 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans text-xs">
          {/* Card 1: Active Course */}
          <Card className="p-4 rounded-2xl border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-300 flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Course</span>
              <div className="font-serif text-base font-bold text-slate-900 dark:text-stone-100 truncate mt-0.5">
                {selectedClass}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Class 12-A</span>
            </div>
          </Card>

          {/* Card 2: Present Scholars */}
          <Card className="p-4 rounded-2xl border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Present Scholars</span>
              <div className="font-serif text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {presentCount} / {roster.length}
              </div>
            </div>
          </Card>

          {/* Card 3: Late / Delayed */}
          <Card className="p-4 rounded-2xl border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Late / Delayed</span>
              <div className="font-serif text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {lateCount} Scholars
              </div>
            </div>
          </Card>

          {/* Card 4: Excused / Absent */}
          <Card className="p-4 rounded-2xl border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300 flex items-center justify-center shrink-0 shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Excused / Absent</span>
              <div className="font-serif text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                {excusedCount + absentCount} Scholars
              </div>
            </div>
          </Card>
        </div>

        {/* Sealed Confirmation Notice if committed */}
        {sealedHash && (
          <div className="p-4 rounded-2xl bg-[#059669]/10 border border-[#059669]/30 flex items-center justify-between font-sans text-xs shadow-xs">
            <div className="flex items-center gap-2.5 text-[#059669]">
              <CheckCircle2 className="w-5 h-5" />
              <span>
                <strong>Attendance Register Sealed:</strong> Roll-call ledger committed to sovereign PostgreSQL partition. Hash: <span className="font-mono font-bold">{sealedHash}</span>
              </span>
            </div>
            <Link href="/teacher/my-day">
              <Button variant="outline" size="sm" className="text-xs">
                Return to My Day
              </Button>
            </Link>
          </div>
        )}

        {/* Roster Table matching Image 3 */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-stone-800 bg-white dark:bg-[#12161f] shadow-xs overflow-hidden">
          {/* Table Header Bar */}
          <div className="p-5 border-b border-slate-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-stone-100">
                  Scholar Roll-Call Check Roster
                </h3>
                <p className="font-sans text-xs text-slate-500 dark:text-stone-400">
                  Turnstile RFID sensor timestamps recorded automatically at campus perimeter.
                </p>
              </div>
            </div>

            {/* Date badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-stone-800 text-xs font-semibold text-slate-600 dark:text-stone-300">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Fri, 5 Sep 2026 • Form VI • 08:30 CET Cutoff</span>
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-slate-50/70 dark:bg-stone-900/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-stone-800">
                <tr>
                  <th className="py-3.5 px-4 text-center w-12">#</th>
                  <th className="py-3.5 px-6">Scholar Name / Class</th>
                  <th className="py-3.5 px-6">House</th>
                  <th className="py-3.5 px-6">Turnstile Edge Event</th>
                  <th className="py-3.5 px-6 text-center">Attendance Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-stone-800">
                {roster.map((student, idx) => {
                  const initials = student.studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("");
                  const colorClass = avatarColors[student.id] || "bg-blue-100 text-blue-700";
                  const houseClass = houseBadges[student.house] || "bg-slate-100 text-slate-700";

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 dark:hover:bg-stone-900/30 transition-colors">
                      <td className="py-4 px-4 text-center font-bold text-slate-400 text-xs">
                        {idx + 1}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${colorClass}`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-serif font-bold text-sm text-slate-900 dark:text-stone-100 leading-tight">
                              {student.studentName}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {student.form}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${houseClass}`}>
                          {student.house.replace(" House", "")}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs">
                        <div className="font-mono font-medium text-slate-800 dark:text-stone-200">
                          {student.turnstileTime}
                        </div>
                        {student.remarks && (
                          <div className="text-[11px] text-rose-600 font-medium mt-0.5">
                            Note: {student.remarks}
                          </div>
                        )}
                      </td>

                      {/* 4 Interactive Toggle Pills matching Image 3 */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex rounded-xl border border-slate-200 dark:border-stone-700 p-0.5 bg-slate-50 dark:bg-stone-900/60 shadow-xs">
                          {[
                            { key: "PRESENT", label: "Present", icon: "✓", activeClass: "bg-[#DCFCE7] text-[#15803D] font-bold shadow-xs border border-emerald-300" },
                            { key: "LATE", label: "Late", icon: "🕒", activeClass: "bg-[#FEF3C7] text-[#B45309] font-bold shadow-xs border border-amber-300" },
                            { key: "EXCUSED", label: "Excused", icon: "✉", activeClass: "bg-[#DBEAFE] text-[#1D4ED8] font-bold shadow-xs border border-blue-300" },
                            { key: "ABSENT", label: "Absent", icon: "✕", activeClass: "bg-[#FFE4E6] text-[#BE123C] font-bold shadow-xs border border-rose-300" },
                          ].map((btn) => (
                            <button
                              key={btn.key}
                              type="button"
                              onClick={() => handleStatusChange(student.id, btn.key as any)}
                              className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 ${
                                student.status === btn.key
                                  ? btn.activeClass
                                  : "text-slate-500 hover:text-slate-900 dark:hover:text-stone-200"
                              }`}
                            >
                              <span>{btn.icon}</span>
                              <span>{btn.label}</span>
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Action Pill Badge matching Image 3 */}
                      <td className="py-4 px-6 text-right">
                        {student.status === "PRESENT" && (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-block">
                            Present
                          </span>
                        )}
                        {student.status === "LATE" && (
                          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold inline-flex items-center gap-1">
                            <span>🕒</span> Late
                          </span>
                        )}
                        {student.status === "EXCUSED" && (
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold inline-flex items-center gap-1">
                            <span>✓</span> Excused
                          </span>
                        )}
                        {student.status === "ABSENT" && (
                          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold inline-block">
                            Absent
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Motivational Quote Banner matching Image 3 */}
        <TeacherQuoteBanner
          icon={<ShieldCheck className="w-6 h-6 text-white" />}
          iconBgClass="bg-[#0A369D] text-white"
          title="Accurate Attendance. Safer Students."
          subtitle="Integrated with biometric turnstiles for a secure campus."
          quote="Discipline today, brighter tomorrows."
        />
      </div>
    </AppShell>
  );
}
