"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
  AlertCircle,
  Sparkles,
  Users,
  GraduationCap,
  X,
  Send,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-context";
import { fetchEnrolledWards, ParentWardProfile, submitAbsenceExcuse } from "@/lib/db/parent";
import { sharedStore, SharedLeaveRequest } from "@/lib/db/shared-store";

export default function ParentLeavePage() {
  const { schoolId } = useAuth();
  const [wards, setWards] = useState<ParentWardProfile[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string>("");
  const [leaveRequests, setLeaveRequests] = useState<SharedLeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [leaveType, setLeaveType] = useState("Medical Leave");
  const [reason, setReason] = useState("");
  const [hasDoctorNote, setHasDoctorNote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const wardsData = await fetchEnrolledWards();
        setWards(wardsData);
        if (wardsData.length > 0) {
          const activeWard = wardsData[0];
          setSelectedWardId(activeWard.id);
          const requests = sharedStore.getLeaveRequests();
          setLeaveRequests(requests);
        } else {
          setLeaveRequests([]);
        }
      } catch (err) {
        console.error("Failed to load wards", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activeWard = wards.find((w) => w.id === selectedWardId) || wards[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please enter a reason for the leave request.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create in sharedStore leave requests
      const newLeave = sharedStore.createLeaveRequest({
        schoolId: schoolId || "",
        applicantType: "STUDENT",
        applicantId: selectedWardId,
        applicantName: activeWard ? activeWard.name : "Student",
        startDate,
        endDate,
        reason,
        leaveType,
        status: "PENDING",
      });

      // 2. Also create in approvals for Principal
      await submitAbsenceExcuse({
        wardId: selectedWardId,
        startDate,
        endDate,
        reason: `${leaveType}: ${reason}`,
        doctorCertificateAttached: hasDoctorNote,
      });

      setLeaveRequests((prev) => [newLeave, ...prev]);
      setShowModal(false);
      setReason("");
      showToast("Leave request sent to the school office for review.");
    } catch (err) {
      console.error(err);
      showToast("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: leaveRequests.length,
    approved: leaveRequests.filter((l) => l.status === "APPROVED").length,
    pending: leaveRequests.filter((l) => l.status === "PENDING").length,
  };

  return (
    <AppShell
      role="PARENT"
      userName="Dr. Vikram Sharma"
      userRoleTitle="Parent / Legal Guardian"
      epochText="Academic Year 2024–2025 • Term 2 (CBSE)"
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#131F37] border border-blue-500/40 text-blue-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Header with Multi-Ward Selector */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Leave &amp; Absences
              </span>
              <span className="text-xs text-slate-400">Official Permission Desk</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Ask for Leave
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Send absence requests to teachers and the school office. Track approvals and attendance status.
            </p>
          </div>

          {/* Ward Switcher Pill */}
          <div className="flex items-center gap-3 bg-[#0F172A] border border-slate-800 p-1.5 rounded-2xl">
            {wards.map((ward) => (
              <button
                key={ward.id}
                onClick={() => setSelectedWardId(ward.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
                  selectedWardId === ward.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#131F37]"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>{ward.name}</span>
                <span className="text-[10px] opacity-75">({ward.form})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Need time off?</span>
              <h3 className="text-base font-bold text-white">Submit New Note</h3>
              <p className="text-xs text-slate-400 mt-1">
                For sick leave, doctor visits, or family emergencies.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              + Request Leave
            </button>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-medium text-slate-400 block">Total Requests</span>
            <div className="text-2xl font-bold text-white mt-2">{stats.total}</div>
            <span className="text-xs text-slate-500 mt-1 block">This academic term</span>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-medium text-emerald-400 block">Approved Leave</span>
            <div className="text-2xl font-bold text-emerald-300 mt-2">{stats.approved}</div>
            <span className="text-xs text-slate-500 mt-1 block">Officially excused</span>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-medium text-amber-400 block">Awaiting Office Decision</span>
            <div className="text-2xl font-bold text-amber-300 mt-2">{stats.pending}</div>
            <span className="text-xs text-slate-500 mt-1 block">In review by Principal</span>
          </div>
        </div>

        {/* Requests History List */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Leave Request History
            </h3>
            <span className="text-xs text-slate-400">
              Showing records for {activeWard?.name || "Selected Child"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#131F37]/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Date(s)</th>
                  <th className="py-3 px-4 font-semibold">Leave Type</th>
                  <th className="py-3 px-4 font-semibold">Reason Provided</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Office Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Loading leave requests...
                    </td>
                  </tr>
                ) : leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No leave requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#131F37]/40 transition">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                        {req.startDate} {req.endDate !== req.startDate ? `to ${req.endDate}` : ""}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white text-xs">
                        {req.leaveType}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300 max-w-xs truncate">
                        {req.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        {req.status === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved &amp; Excused
                          </span>
                        ) : req.status === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                            <XCircle className="w-3.5 h-3.5" /> Declined
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3.5 h-3.5" /> Pending Decision
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {req.reviewNotes || (req.status === "APPROVED" ? "Granted by Principal" : "Awaiting review")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Submitting New Leave */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" /> Ask for Leave
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Student</label>
                  <div className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white font-medium flex items-center justify-between">
                    <span>{activeWard?.name}</span>
                    <span className="text-xs text-blue-400">{activeWard?.form}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Leave Category</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Medical Leave">Medical Leave (Doctor Advised)</option>
                    <option value="Family Function">Family Event / Outstation Travel</option>
                    <option value="Academic Duty">Academic / Sports Competition</option>
                    <option value="Personal Emergency">Personal Emergency</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Reason for Absence *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Briefly describe the reason for missing school..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="doctorNote"
                    checked={hasDoctorNote}
                    onChange={(e) => setHasDoctorNote(e.target.checked)}
                    className="rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="doctorNote" className="text-xs text-slate-300">
                    I will provide a doctor note or medical prescription to the school clinic.
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-600/20 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? "Sending..." : "Submit Leave Note"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
