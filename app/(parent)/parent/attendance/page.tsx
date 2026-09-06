"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Modal } from "@/components/ui/modal";
import {
  fetchEnrolledWards,
  fetchWardAttendanceHistory,
  submitAbsenceExcuse,
  ParentWardProfile,
  WardAttendanceRecord,
} from "@/lib/db/parent";
import {
  CalendarDays,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  Heart,
  FileText,
  Crosshair,
  Sparkles,
  Download,
  Eye,
} from "lucide-react";
import { PdfPreviewModal } from "@/components/ui/pdf-preview-modal";
import { useAuth } from "@/components/providers/auth-context";

export default function ParentAttendancePage() {
  const { profile, currentSchool } = useAuth();
  const [wards, setWards] = React.useState<ParentWardProfile[]>([]);
  const [selectedWardId, setSelectedWardId] = React.useState<string>("");
  const [records, setRecords] = React.useState<WardAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [previewDoc, setPreviewDoc] = React.useState<{
    isOpen: boolean;
    title: string;
    fileName: string;
    content: string;
    studentMeta?: { name?: string; form?: string; rollNumber?: string; house?: string };
  } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [excuseSuccess, setExcuseSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    date: new Date().toISOString().split("T")[0],
    reasonCategory: "MEDICAL",
    reason: "",
    hasCertificate: false,
  });

  React.useEffect(() => {
    async function loadData() {
      try {
        const wardsData = await fetchEnrolledWards();
        setWards(wardsData);
        const activeId = selectedWardId || (wardsData[0] ? wardsData[0].id : "ward-01");
        const history = await fetchWardAttendanceHistory(activeId);
        setRecords(history);
      } catch (err) {
        console.error("Failed to load attendance", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedWardId]);

  const activeWard = wards.find((w) => w.id === selectedWardId) || wards[0];

  const handleDownloadAttendanceStatement = () => {
    const studentName = activeWard?.name || "Student";
    const studentForm = activeWard?.form || "Class";
    const studentRoll = activeWard?.rollNumber || "N/A";
    const studentHouse = activeWard?.house || "N/A";

    let logsText = "DATE & DAY | ENTRY GATE | TIME | STATUS | REMARKS\n";
    logsText += "--------------------------------------------------------------------------------\n";
    records.forEach((r) => {
      logsText += `${r.date} (${r.dayOfWeek}) | ${r.turnstileGate} | ${r.timestamp} | ${r.status} | ${r.sessionRemarks}\n`;
    });

    const content = `OFFICIAL GATE ATTENDANCE & BIOMETRIC REPORT
Term: Academic Attendance
Institution: ${currentSchool?.name || currentSchool?.legal_name || "School Administration"}

CANDIDATE INFORMATION:
Student Name: ${studentName}
Class & Section: ${studentForm}
Admission Roll No: ${studentRoll}
House Affiliation: ${studentHouse}

SMART RFID LOGS & CLASS PERIOD CHECK-INS:
${logsText}

INSTITUTIONAL NOTES:
1. Daily attendance is recorded electronically.
2. Class attendance is synchronized with the Teacher Register by authorized faculty.`;

    setPreviewDoc({
      isOpen: true,
      title: "RFID Attendance Statement",
      fileName: `Attendance_Statement_${studentName.replace(/\s+/g, "_")}.pdf`,
      content,
      studentMeta: {
        name: studentName,
        form: studentForm,
        rollNumber: studentRoll,
        house: studentHouse,
      },
    });
  };

  const handleDownloadLeaveReceipt = () => {
    const studentName = activeWard?.name || "Student";
    const studentForm = activeWard?.form || "Class";
    const studentRoll = activeWard?.rollNumber || "N/A";
    const studentHouse = activeWard?.house || "N/A";

    const content = `OFFICIAL PARENTAL LEAVE APPLICATION RECEIPT
Receipt ID: LEAVE-APP-${Date.now().toString().slice(-6)}
Date of Filing: ${new Date().toLocaleDateString("en-IN")}
Status: SUBMITTED (Pending Faculty Approval)

STUDENT DETAILS:
Name: ${studentName}
Class / Section: ${studentForm}
Roll No: ${studentRoll}
House: ${studentHouse}
Parent / Guardian: ${profile?.full_name || "Parent"}

LEAVE APPLICATION DETAILS:
Date of Absence: ${formData.date}
Category: ${formData.reasonCategory}
Reason / Note: ${formData.reason || "Parent notification submitted via School Portal"}
Doctor Certificate: ${formData.hasCertificate ? "Attached" : "Not Required / Standard Day Leave"}

APPROVAL WORKFLOW:
Reviewing Teacher: Class Faculty Coordinator
ERP Gate Clearance: Updated on approval`;

    setPreviewDoc({
      isOpen: true,
      title: "Parental Leave Application Receipt",
      fileName: `Leave_Application_Receipt_${studentName.replace(/\s+/g, "_")}.pdf`,
      content,
      studentMeta: {
        name: studentName,
        form: studentForm,
        rollNumber: studentRoll,
        house: studentHouse,
      },
    });
  };

  const handleSubmitExcuse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitAbsenceExcuse({
        wardId: selectedWardId,
        date: formData.date,
        reason: formData.reason,
        doctorCertificateAttached: formData.hasCertificate,
      });
      setExcuseSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setExcuseSuccess(false);
        setFormData({
          date: new Date().toISOString().split("T")[0],
          reasonCategory: "MEDICAL",
          reason: "",
          hasCertificate: false,
        });
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      role="PARENT"
      userName={profile?.full_name || "Parent"}
      userRoleTitle={`Parent${activeWard?.name ? ` • ${activeWard.name}` : ""}`}
      epochText="Academic Attendance"
    >
      <div className="space-y-6">
        {/* Top Brow & Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[11px] font-bold text-[#8C6D27] dark:text-amber-400 uppercase tracking-widest">
                DAILY ATTENDANCE &amp; GATE ENTRY
              </span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="font-sans text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                Attendance Rate: 99.2%
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-stone-100">
              Student Attendance &amp; Daily Records
            </h1>
            <p className="font-sans text-xs md:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
              Check daily smart RFID gate entry times, class attendance records, and apply for student leave online.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 self-start lg:self-center">
            {/* Child Switcher Pills */}
            <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-900/80 p-1 rounded-xl border border-stone-200/80 dark:border-stone-800">
              {wards.map((w) => {
                const isActive = w.id === selectedWardId;
                return (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWardId(w.id)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

            {/* Download Statement Action */}
            <button
              type="button"
              onClick={handleDownloadAttendanceStatement}
              className="px-4 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-[#8C6D27]" />
              <span>Download Statement (PDF)</span>
            </button>

            {/* Apply for Leave Action Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#8C6D27] hover:bg-[#785c1f] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>

        {/* 3 Top Attendance KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Days Attended */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 border-l-4 border-l-[#10B981] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/40 text-[#10B981] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
                DAYS ATTENDED
              </span>
              <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mt-0.5 block">
                18 Days (98.4%)
              </span>
              <span className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">
                Present on all regular working days
              </span>
            </div>
          </div>

          {/* Card 2: Late Arrivals */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 border-l-4 border-l-[#F59E0B] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFFBEB] dark:bg-amber-950/40 text-[#F59E0B] flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="font-sans text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
                LATE ARRIVALS
              </span>
              <span className="font-serif text-2xl font-bold text-[#8C6D27] dark:text-amber-400 mt-0.5 block">
                1 Day
              </span>
              <span className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">
                School bus delayed by traffic (Jan 09)
              </span>
            </div>
          </div>

          {/* Card 3: Approved Leave */}
          <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 border-l-4 border-l-[#F43F5E] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF1F2] dark:bg-rose-950/40 text-[#F43F5E] flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 fill-rose-500/20 text-rose-500" />
            </div>
            <div>
              <span className="font-sans text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
                APPROVED MEDICAL LEAVE
              </span>
              <span className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mt-0.5 block">
                1 Day
              </span>
              <span className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">
                Doctor certificate verified (Jan 07)
              </span>
            </div>
          </div>
        </div>

        {/* RFID Gate Entry & Class Attendance Table */}
        <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-4 md:p-5 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-[#8C6D27] flex items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Gate Entry &amp; Daily Attendance (January 2025)
              </h3>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/40 text-xs font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>ACADEMIC YEAR 2024–2025</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800 text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 tracking-wider">
                  <th className="py-3.5 px-5">DATE &amp; DAY</th>
                  <th className="py-3.5 px-5">ENTRY GATE</th>
                  <th className="py-3.5 px-5">TIME</th>
                  <th className="py-3.5 px-5">STATUS</th>
                  <th className="py-3.5 px-5">REMARKS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {records.map((row) => (
                  <tr key={row.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-900/40 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-stone-900 dark:text-stone-100">
                      <div>{row.date}</div>
                      <div className="text-[11px] text-stone-400 font-normal">{row.dayOfWeek}</div>
                    </td>
                    <td className="py-3.5 px-5 text-stone-700 dark:text-stone-300 font-medium">
                      {row.turnstileGate}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-stone-800 dark:text-stone-200 font-semibold">
                      {row.timestamp}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          row.status === "PRESENT"
                            ? "bg-[#DCFCE7] dark:bg-emerald-950/50 text-[#15803D] dark:text-emerald-300"
                            : row.status === "LATE"
                            ? "bg-[#FEF3C7] dark:bg-amber-950/50 text-[#B45309] dark:text-amber-300"
                            : "bg-[#FFE4E6] dark:bg-rose-950/50 text-[#BE123C] dark:text-rose-300"
                        }`}
                      >
                        {row.status === "EXCUSED" ? "LEAVE" : row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-stone-600 dark:text-stone-400 text-xs">
                      {row.sessionRemarks || "Regular check-in recorded."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Guidance Banner */}
        <div className="bg-[#F0F7FF] dark:bg-[#111c2e] rounded-2xl border border-[#DCEBFE] dark:border-blue-900/40 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Notepad Spiral Illustration */}
            <div className="w-12 h-14 relative shrink-0">
              <svg viewBox="0 0 48 56" fill="none" className="w-full h-full drop-shadow-xs">
                <rect x="4" y="8" width="40" height="46" rx="6" fill="#3B82F6" />
                <rect x="6" y="10" width="36" height="42" rx="4" fill="#FFFFFF" />
                <circle cx="12" cy="6" r="2.5" fill="#60A5FA" />
                <circle cx="20" cy="6" r="2.5" fill="#60A5FA" />
                <circle cx="28" cy="6" r="2.5" fill="#60A5FA" />
                <circle cx="36" cy="6" r="2.5" fill="#60A5FA" />
                <path d="M12 20L15 23L22 16" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="26" y1="20" x2="36" y2="20" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 30L15 33L22 26" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="26" y1="30" x2="36" y2="30" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 40L15 43L22 36" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="26" y1="40" x2="36" y2="40" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3 className="font-serif text-lg md:text-xl font-bold text-[#1E3A8A] dark:text-blue-200 leading-snug">
                Good Attendance
                <br />
                Builds a Brighter Tomorrow
              </h3>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Regular attendance helps your child stay confident and learn better.
              </p>
            </div>
          </div>

          {/* 3 Guidance Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                <Crosshair className="w-5 h-5" />
              </div>
              <div>
                <div className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100">Be Punctual</div>
                <div className="font-sans text-[11px] text-stone-500 dark:text-stone-400">Reach school on time</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100">Stay Regular</div>
                <div className="font-sans text-[11px] text-stone-500 dark:text-stone-400">Maintain daily attendance</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <div className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100">Inform for Leave</div>
                <div className="font-sans text-[11px] text-stone-500 dark:text-stone-400">Submit note if unwell</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Application Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Apply for Leave"
        description={`Submit a leave request for ${activeWard?.name} (${activeWard?.form}).`}
        maxWidth="md"
      >
        <form onSubmit={handleSubmitExcuse} className="space-y-4 mt-2">
          {excuseSuccess ? (
            <div className="p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
              <p className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Leave Application Submitted!
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                The school attendance register will be updated once approved by the Class Teacher.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDownloadLeaveReceipt}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8C6D27] text-white text-xs font-bold hover:bg-[#785c1f] transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Leave Receipt (PDF)</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Leave Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Reason for Leave
                </label>
                <select
                  value={formData.reasonCategory}
                  onChange={(e) => setFormData({ ...formData, reasonCategory: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                >
                  <option value="MEDICAL">Medical Leave / Sick</option>
                  <option value="FAMILY">Family Function / Emergency</option>
                  <option value="COMPETITION">Inter-School Competition / Sports Meet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Remarks / Note
                </label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
                  <span>Download Draft Receipt</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#8C6D27] hover:bg-[#785c1f] shadow-xs disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Leave Application"}
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
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
