"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  fetchStudentAttendanceRadar,
  fetchStudentProfile,
  submitGatePassRequest,
  StudentAttendanceEntry,
  StudentProfile,
} from "@/lib/db/student";
import { triggerClientDownload } from "@/lib/utils";
import { PdfPreviewModal, PDFStudentMetadata } from "@/components/ui/pdf-preview-modal";
import { useAuth } from "@/components/providers/auth-context";
import {
  CalendarDays,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  Flame,
  Users,
  Moon,
  Send,
  GraduationCap,
  Download,
  FileCheck2,
} from "lucide-react";

export default function StudentAttendancePage() {
  const { profile, school } = useAuth();
  const [studentProfile, setStudentProfile] = React.useState<StudentProfile | null>(null);
  const [logs, setLogs] = React.useState<StudentAttendanceEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Modal State
  const [isPassModalOpen, setIsPassModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [passSuccess, setPassSuccess] = React.useState(false);
  const [generatedPassId, setGeneratedPassId] = React.useState("");
  const [passData, setPassData] = React.useState({
    passType: "WEEKEND_EXEAT" as "WEEKEND_EXEAT" | "TOWN_LEAVE" | "ACADEMIC_VISIT",
    destination: "",
    departureTime: "",
    returnTime: "",
    emergencyContact: "",
  });

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
        const [data, sProfile] = await Promise.all([
          fetchStudentAttendanceRadar(),
          fetchStudentProfile(),
        ]);
        setLogs(data);
        setStudentProfile(sProfile);
      } catch (err) {
        console.error("Failed to load attendance radar", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRequestPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await submitGatePassRequest(passData);
      setGeneratedPassId(res.passId);
      setPassSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadGatePass = () => {
    const studentName = profile?.full_name || studentProfile?.name || "Student";
    setPreviewDoc({
      isOpen: true,
      title: "Campus Gate Pass Slip",
      fileName: `Gate_Pass_${generatedPassId || "EXEAT"}.pdf`,
      content: `=== ${school?.name || "AGRAGATI SCHOOL OS"} • DIGITAL CAMPUS GATE PASS ===\n\nPass Identifier: ${generatedPassId || "PASS-EXEAT"}\nStudent: ${studentName}\nDestination: ${passData.destination}\nDeparture: ${passData.departureTime}\nReturn Deadline: ${passData.returnTime}\nGuardian Emergency Contact: ${passData.emergencyContact}\n\nStatus: PENDING HOUSEMASTER AUTHORIZATION\nSmart RFID Turnstile Sync: ACTIVE`,
      studentMeta: {
        name: studentName,
        classSection: studentProfile?.form || "",
        rollNumber: studentProfile?.rollNumber || "",
        academicSession: "2024-2025",
        institutionName: school?.name || "AGRAGATI MODERN ACADEMY",
      },
    });
  };

  const handleDownloadAttendanceStatement = () => {
    const studentName = profile?.full_name || studentProfile?.name || "Student";
    const presentCount = logs.filter((l) => l.status === "PRESENT").length;
    const totalCount = logs.length;
    const rate = totalCount > 0 ? `${Math.round((presentCount / totalCount) * 100)}%` : "0%";
    setPreviewDoc({
      isOpen: true,
      title: "Monthly Attendance & Gate RFID Statement",
      fileName: `${studentName.replace(/\s+/g, "_")}_Attendance_Statement.pdf`,
      content: `=== ${school?.name || "AGRAGATI SCHOOL OS"} • OFFICIAL ATTENDANCE STATEMENT ===\nStudent Name: ${studentName}\nClass: ${studentProfile?.form || "Enrolled Class"}\nRoll Number: ${studentProfile?.rollNumber || "N/A"}\n\nTotal Recorded Days: ${totalCount}\nDays Attended: ${presentCount} (${rate} Attendance)\nLate Arrivals: ${logs.filter((l) => l.status === "LATE").length}\nApproved Leaves: ${logs.filter((l) => l.status === "EXCUSED").length}`,
      studentMeta: {
        name: studentName,
        classSection: studentProfile?.form || "",
        rollNumber: studentProfile?.rollNumber || "",
        academicSession: "2024-2025",
        institutionName: school?.name || "AGRAGATI MODERN ACADEMY",
      },
    });
  };

  return (
    <AppShell
      role="STUDENT"
      userName={profile?.full_name || studentProfile?.name || "Student"}
      userRoleTitle={studentProfile?.form ? `Student • ${studentProfile.form}${studentProfile.house ? ` • ${studentProfile.house}` : ""}` : "Student"}
      epochText="Academic Year 2024–2025 • Term 2 (CBSE Board)"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[10px] font-bold text-[#8C6D27] dark:text-amber-400 uppercase tracking-widest">
                DAILY ATTENDANCE &amp; SMART RFID GATE
              </span>
              <span className="text-stone-300 dark:text-stone-700 text-xs">•</span>
              <span className="font-sans text-[10px] font-medium text-stone-500 dark:text-stone-400">
                Turnstile Gate 01 RFID Synced
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Attendance &amp; Campus Passes
            </h1>
            <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
              Track your daily biometric entry timestamps, maintain your attendance streak, and request housemaster gate passes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 z-10">
            <button
              type="button"
              onClick={handleDownloadAttendanceStatement}
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-[#8C6D27]" />
              <span>Download Statement (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPassSuccess(false);
                setIsPassModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#8C6D27] hover:bg-[#785c1f] text-white font-sans text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <CalendarDays className="w-4 h-4 text-amber-200" />
              <span>Request Leave / Gate Pass</span>
            </button>
          </div>
        </div>

        {/* 3 Telemetry Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Consecutive Streak */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                CONSECUTIVE STREAK
              </span>
              <div className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                {studentProfile?.consecutiveStreakDays ?? 0} Days
              </div>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Roll-Call Record
              </p>
            </div>
          </div>

          {/* Card 2: Term Attendance Rate */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                  ATTENDANCE RATE
                </span>
                <div className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  {logs.length > 0
                    ? `${Math.round((logs.filter((l) => l.status === "PRESENT").length / logs.length) * 100)}%`
                    : (studentProfile?.attendanceRate || "0.0%")}
                </div>
                <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {logs.filter((l) => l.status === "PRESENT").length} / {logs.length} Sessions Present
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Gate Timing */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-[#8C6D27] dark:text-amber-300 flex items-center justify-center shrink-0">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                CAMPUS GATE TIMING
              </span>
              <div className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                21:00 IST
              </div>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {studentProfile?.house ? `${studentProfile.house} Gate Lock` : "Campus Gate"}
              </p>
            </div>
          </div>
        </div>

        {/* Turnstile RFID Logs Table Card */}
        <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-[0_1px_4px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-4 md:p-5 bg-stone-50/50 dark:bg-stone-900/30 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-[#8C6D27] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Gate Entry &amp; Roll-Call Logs
              </span>
            </div>
            {studentProfile?.rollNumber && (
              <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-sans text-[10px] font-bold uppercase tracking-wider border border-stone-200/70 dark:border-stone-700">
                ROLL NO: {studentProfile.rollNumber}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800 text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 tracking-wider">
                  <th className="py-3.5 px-5">DATE &amp; DAY</th>
                  <th className="py-3.5 px-5">ENTRY GATE</th>
                  <th className="py-3.5 px-5">TIMESTAMP</th>
                  <th className="py-3.5 px-5 text-center">STATUS</th>
                  <th className="py-3.5 px-5">REMARKS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-500 text-xs">
                      No gate entry or attendance records found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-900/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-stone-900 dark:text-stone-100 block">
                        {log.date}
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">{log.dayOfWeek}</span>
                    </td>
                    <td className="py-3.5 px-5 text-stone-700 dark:text-stone-300 font-medium">
                      {log.turnstileGate}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-stone-700 dark:text-stone-300">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.status === "PRESENT"
                            ? "bg-emerald-100/90 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300"
                            : log.status === "LATE"
                            ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300"
                            : "bg-sky-100 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300"
                        }`}
                      >
                        {log.status === "EXCUSED" ? "LEAVE" : log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-stone-500 dark:text-stone-400 text-xs">
                      {log.remarks || "—"}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Motivational Banner */}
        <div className="bg-white dark:bg-[#151922] rounded-2xl border border-amber-200/70 dark:border-amber-900/40 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-[#8C6D27] flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100">
                Regular Attendance Builds Great Minds
              </h3>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Every day counts towards academic distinction and honors.
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-serif italic text-sm text-stone-700 dark:text-stone-300">
              &ldquo;Discipline today leads to freedom tomorrow.&rdquo;
            </p>
            <div className="w-12 h-1 bg-[#8C6D27] rounded-full mt-2 ml-auto" />
          </div>
        </div>

        {/* Request Gate Exeat Pass Modal */}
        <Modal
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
          title="Request Campus Leave / Exeat Pass"
          description="Submit an authorized campus pass for biometric gate authorization."
          maxWidth="lg"
        >
          {passSuccess ? (
            <div className="p-6 text-center space-y-4 font-sans text-xs">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                  Gate Pass Generated &amp; Dispatched!
                </h3>
                <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Pass Reference: <strong className="font-mono text-stone-900 dark:text-stone-100">{generatedPassId}</strong>
                </p>
                <p className="text-stone-500 dark:text-stone-400 mt-0.5">
                  Your request has been approved and synced with Smart RFID Gate 01.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleDownloadGatePass}
                  className="px-4 py-2.5 rounded-xl bg-[#8C6D27] hover:bg-[#785c1f] text-white font-semibold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Gate Pass Slip (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPassModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 font-semibold hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRequestPass} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-semibold text-stone-900 dark:text-stone-100 mb-1">
                  Leave Pass Category
                </label>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:bg-white dark:focus:bg-stone-800 focus:ring-1 focus:ring-amber-500"
                  value={passData.passType}
                  onChange={(e) =>
                    setPassData({
                      ...passData,
                      passType: e.target.value as any,
                    })
                  }
                >
                  <option value="WEEKEND_EXEAT">Weekend Exeat (Fri 17:00 – Sun 20:30)</option>
                  <option value="TOWN_LEAVE">Day Leave (Afternoon 15:45 – 19:00)</option>
                  <option value="ACADEMIC_VISIT">Academic Research &amp; Olympiad Visit</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-900 dark:text-stone-100 mb-1">
                  Destination &amp; Address
                </label>
                <Input
                  required
                  placeholder="e.g. Vasant Kunj / Sharma Family Residence, New Delhi"
                  value={passData.destination}
                  onChange={(e) => setPassData({ ...passData, destination: e.target.value })}
                  className="text-xs rounded-xl dark:bg-stone-900 dark:border-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-900 dark:text-stone-100 mb-1">
                    Departure Time
                  </label>
                  <Input
                    type="datetime-local"
                    required
                    value={passData.departureTime}
                    onChange={(e) => setPassData({ ...passData, departureTime: e.target.value })}
                    className="text-xs font-mono rounded-xl dark:bg-stone-900 dark:border-stone-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-900 dark:text-stone-100 mb-1">
                    Return Deadline
                  </label>
                  <Input
                    type="datetime-local"
                    required
                    value={passData.returnTime}
                    onChange={(e) => setPassData({ ...passData, returnTime: e.target.value })}
                    className="text-xs font-mono rounded-xl dark:bg-stone-900 dark:border-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-900 dark:text-stone-100 mb-1">
                  Parent / Guardian Emergency Contact
                </label>
                <Input
                  required
                  value={passData.emergencyContact}
                  onChange={(e) => setPassData({ ...passData, emergencyContact: e.target.value })}
                  className="text-xs rounded-xl dark:bg-stone-900 dark:border-stone-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsPassModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-semibold hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#8C6D27] hover:bg-[#785c1f] text-white font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Submitting..." : "Submit to Housemaster"}</span>
                </button>
              </div>
            </form>
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
