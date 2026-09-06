"use client";

import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Eye,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-context";
import {
  getAdmissions,
  createAdmission,
  updateAdmissionStatus,
  enrollApplicant,
  getAdmissionStats,
  AdmissionStatus,
} from "@/lib/services/admissions-service";
import { SharedAdmission } from "@/lib/db/shared-store";

export default function AdmissionsPage() {
  const { schoolId, school } = useAuth();
  const [admissions, setAdmissions] = useState<SharedAdmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedAdmission, setSelectedAdmission] = useState<SharedAdmission | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state for new admission
  const [formData, setFormData] = useState({
    applicantName: "",
    dateOfBirth: "",
    gender: "Male",
    gradeApplyingFor: "Class 1",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    address: "",
    notes: "",
    entranceScore: "",
  });

  const activeSchoolId = schoolId || school?.id;

  const loadData = async () => {
    if (!activeSchoolId) {
      setAdmissions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getAdmissions(activeSchoolId);
      setAdmissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSchoolId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStatusChange = async (id: string, newStatus: AdmissionStatus) => {
    const updated = await updateAdmissionStatus(id, newStatus);
    if (updated) {
      setAdmissions((prev) => prev.map((a) => (a.id === id ? updated : a)));
      if (selectedAdmission?.id === id) {
        setSelectedAdmission(updated);
      }
      showToast(`Application marked as ${newStatus.replace("_", " ")}`);
    }
  };

  const handleEnroll = async (id: string) => {
    const res = await enrollApplicant(id);
    if (res) {
      setAdmissions((prev) => prev.map((a) => (a.id === id ? res.admission : a)));
      if (selectedAdmission?.id === id) {
        setSelectedAdmission(res.admission);
      }
      showToast(`Student enrolled successfully! Assigned ID: ${res.studentId}`);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.applicantName || !formData.parentName || !formData.parentPhone) {
      alert("Please fill in the required fields: Student Name, Parent Name, and Phone Number.");
      return;
    }

    if (!activeSchoolId) {
      alert("No active school found for this session.");
      return;
    }

    const created = await createAdmission({
      schoolId: activeSchoolId,
      applicantName: formData.applicantName,
      dateOfBirth: formData.dateOfBirth || new Date().toISOString().split("T")[0],
      gender: formData.gender,
      gradeApplyingFor: formData.gradeApplyingFor,
      parentName: formData.parentName,
      parentEmail: formData.parentEmail || "",
      parentPhone: formData.parentPhone,
      address: formData.address || "",
      notes: formData.notes,
      entranceScore: formData.entranceScore ? parseFloat(formData.entranceScore) : undefined,
    });

    setAdmissions((prev) => [created, ...prev]);
    setShowNewModal(false);
    setFormData({
      applicantName: "",
      dateOfBirth: "",
      gender: "Male",
      gradeApplyingFor: "Class 1",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      address: "",
      notes: "",
      entranceScore: "",
    });
    showToast(`New application submitted for ${created.applicantName}`);
  };

  const filteredAdmissions = admissions.filter((item) => {
    const matchesSearch =
      item.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gradeApplyingFor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: admissions.length,
    pending: admissions.filter((a) => a.status === "PENDING" || a.status === "UNDER_REVIEW").length,
    interviews: admissions.filter((a) => a.status === "INTERVIEW_SCHEDULED").length,
    approved: admissions.filter((a) => a.status === "APPROVED").length,
    enrolled: admissions.filter((a) => a.status === "ENROLLED").length,
  };

  const getStatusBadge = (status: AdmissionStatus) => {
    switch (status) {
      case "ENROLLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled Scholar
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Check className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case "INTERVIEW_SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Calendar className="w-3.5 h-3.5" /> Interview Booked
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
            <Clock className="w-3.5 h-3.5" /> New Application
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#080E1E] text-slate-100 p-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#131F37] border border-blue-500/40 text-blue-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Student Admissions</h1>
              <p className="text-sm text-slate-400">
                Track new student applications, schedule meetings, and enroll children into classes.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition duration-150"
          >
            <UserPlus className="w-4 h-4" />
            + New Student Application
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-medium text-slate-400">All Applications</span>
          <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          <span className="text-xs text-slate-500 mt-1 block">Current session</span>
        </div>
        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-medium text-amber-400">Needs Review</span>
          <div className="text-2xl font-bold text-amber-300 mt-1">{stats.pending}</div>
          <span className="text-xs text-slate-500 mt-1 block">Awaiting decision</span>
        </div>
        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-medium text-purple-400">Interviews</span>
          <div className="text-2xl font-bold text-purple-300 mt-1">{stats.interviews}</div>
          <span className="text-xs text-slate-500 mt-1 block">Interaction meetings</span>
        </div>
        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-medium text-blue-400">Approved</span>
          <div className="text-2xl font-bold text-blue-300 mt-1">{stats.approved}</div>
          <span className="text-xs text-slate-500 mt-1 block">Ready to enroll</span>
        </div>
        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-medium text-emerald-400">Enrolled Scholars</span>
          <div className="text-2xl font-bold text-emerald-300 mt-1">{stats.enrolled}</div>
          <span className="text-xs text-slate-500 mt-1 block">Joined campus roster</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0F172A]/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, parent, or application no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#131F37] border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { label: "All", value: "ALL" },
            { label: "New", value: "PENDING" },
            { label: "Reviewing", value: "UNDER_REVIEW" },
            { label: "Interview", value: "INTERVIEW_SCHEDULED" },
            { label: "Approved", value: "APPROVED" },
            { label: "Enrolled", value: "ENROLLED" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === tab.value
                  ? "bg-blue-600 text-white"
                  : "bg-[#131F37] text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-[#0F172A]/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#131F37]/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">App Number</th>
                <th className="py-3.5 px-4 font-semibold">Student Name</th>
                <th className="py-3.5 px-4 font-semibold">Applying For</th>
                <th className="py-3.5 px-4 font-semibold">Parent & Phone</th>
                <th className="py-3.5 px-4 font-semibold">Score / Test</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading student applications...
                  </td>
                </tr>
              ) : filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <UserPlus className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    No student applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-[#131F37]/40 transition duration-150">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-blue-400">
                      {adm.applicationNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{adm.applicantName}</div>
                      <div className="text-xs text-slate-500">{adm.gender} • Born {adm.dateOfBirth}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md">
                        <GraduationCap className="w-3 h-3 text-blue-400" />
                        {adm.gradeApplyingFor}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-200">{adm.parentName}</div>
                      <div className="text-xs text-slate-400 font-mono">{adm.parentPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {adm.entranceScore ? (
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {adm.entranceScore}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(adm.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedAdmission(adm)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#131F37] hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition"
                        >
                          View Details
                        </button>
                        {adm.status === "APPROVED" && (
                          <button
                            onClick={() => handleEnroll(adm.id)}
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                          >
                            Enroll Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Action Modal */}
      {selectedAdmission && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-fade-in text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-blue-400">{selectedAdmission.applicationNo}</span>
                <h2 className="text-xl font-bold text-white">{selectedAdmission.applicantName}</h2>
              </div>
              <button
                onClick={() => setSelectedAdmission(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-[#131F37]/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Applying For</span>
                <span className="font-semibold text-white">{selectedAdmission.gradeApplyingFor}</span>
              </div>
              <div className="bg-[#131F37]/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Current Status</span>
                <div>{getStatusBadge(selectedAdmission.status)}</div>
              </div>
              <div className="bg-[#131F37]/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Parent / Guardian</span>
                <span className="font-medium text-white">{selectedAdmission.parentName}</span>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-blue-400" /> {selectedAdmission.parentPhone}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-blue-400" /> {selectedAdmission.parentEmail}
                </div>
              </div>
              <div className="bg-[#131F37]/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Residential Address</span>
                <div className="text-xs text-slate-300 flex items-start gap-1">
                  <MapPin className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                  {selectedAdmission.address}
                </div>
                {selectedAdmission.entranceScore && (
                  <div className="mt-2 text-xs text-slate-300">
                    <span className="text-slate-400">Test Score: </span>
                    <span className="font-bold text-emerald-400">{selectedAdmission.entranceScore}%</span>
                  </div>
                )}
              </div>
            </div>

            {selectedAdmission.notes && (
              <div className="bg-[#131F37]/40 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-slate-400 block mb-1">Application Notes:</span>
                {selectedAdmission.notes}
              </div>
            )}

            {/* Status Change Buttons */}
            <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Advance Workflow:</span>
              <div className="flex flex-wrap gap-2">
                {selectedAdmission.status !== "UNDER_REVIEW" && selectedAdmission.status !== "ENROLLED" && (
                  <button
                    onClick={() => handleStatusChange(selectedAdmission.id, "UNDER_REVIEW")}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 transition"
                  >
                    Mark Under Review
                  </button>
                )}
                {selectedAdmission.status !== "INTERVIEW_SCHEDULED" && selectedAdmission.status !== "ENROLLED" && (
                  <button
                    onClick={() => handleStatusChange(selectedAdmission.id, "INTERVIEW_SCHEDULED")}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition"
                  >
                    Schedule Interview
                  </button>
                )}
                {selectedAdmission.status !== "APPROVED" && selectedAdmission.status !== "ENROLLED" && (
                  <button
                    onClick={() => handleStatusChange(selectedAdmission.id, "APPROVED")}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
                  >
                    Approve Application
                  </button>
                )}
                {selectedAdmission.status === "APPROVED" && (
                  <button
                    onClick={() => handleEnroll(selectedAdmission.id)}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-600/20"
                  >
                    Enroll as Student
                  </button>
                )}
                {selectedAdmission.status !== "REJECTED" && selectedAdmission.status !== "ENROLLED" && (
                  <button
                    onClick={() => handleStatusChange(selectedAdmission.id, "REJECTED")}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30 transition"
                  >
                    Decline
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Application Intake Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-fade-in text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" /> New Student Application
              </h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Rao"
                    value={formData.applicantName}
                    onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                    className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Grade Applying For *</label>
                  <select
                    value={formData.gradeApplyingFor}
                    onChange={(e) => setFormData({ ...formData, gradeApplyingFor: e.target.value })}
                    className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11 - Science Stream">Class 11 - Science Stream</option>
                    <option value="Class 11 - Commerce Stream">Class 11 - Commerce Stream</option>
                    <option value="Class 11 - Humanities Stream">Class 11 - Humanities Stream</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Parent / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Rao"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Parent Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Parent Email</label>
                  <input
                    type="email"
                    placeholder="parent@example.com"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Entrance Test Score (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 88.5"
                    value={formData.entranceScore}
                    onChange={(e) => setFormData({ ...formData, entranceScore: e.target.value })}
                    className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="Street name, neighborhood, city"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Notes / Special Requests</label>
                <textarea
                  rows={2}
                  placeholder="Any extra info, sports interests, previous school records..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#131F37] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-600/20"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
