"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Modal } from "@/components/ui/modal";
import { triggerClientDownload } from "@/lib/utils";
import { PdfPreviewModal, PDFStudentMetadata } from "@/components/ui/pdf-preview-modal";
import {
  fetchStudentNotices,
  StudentBulletinItem,
} from "@/lib/db/student";
import {
  Bell,
  Building2,
  Calendar,
  Sparkles,
  Users,
  Plane,
  Home,
  Megaphone,
  ChevronRight,
  GraduationCap,
  CalendarDays,
  Rocket,
  Download,
  FileText,
  CheckCircle2,
  Search,
  Filter,
} from "lucide-react";

export default function StudentNoticesPage() {
  const [notices, setNotices] = React.useState<StudentBulletinItem[]>([]);
  const [categoryFilter, setCategoryFilter] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedNotice, setSelectedNotice] = React.useState<StudentBulletinItem | null>(null);
  const [acknowledgedIds, setAcknowledgedIds] = React.useState<string[]>([]);
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
        const data = await fetchStudentNotices();
        setNotices(data);
      } catch (err) {
        console.error("Failed to load student notices", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDownloadCircular = (notice: StudentBulletinItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const safeTitle = notice.title.replace(/[^a-zA-Z0-9]/g, "_");
    const content = `=== AGRAGATI ACADEMY • OFFICIAL ADMINISTRATIVE CIRCULAR ===\nCircular Reference: CIR-${notice.id.toUpperCase()}-${notice.date.replace(/-/g, "")}\nDate: ${notice.date}\nCategory: ${notice.category}\nAuthority: ${notice.author}\nSubject: ${notice.title}\n\nOFFICIAL ANNOUNCEMENT SUMMARY:\n${notice.summary}\n\nCOMPLETE CIRCULAR DIRECTIVE:\n${notice.body}\n\nDIRECTIVES FOR STUDENTS & PARENTS:\n1. Compliance with the designated schedule is required.\n2. For queries, contact the Housemaster (Prof. Rajesh Verma) or Dean's Office.\n3. Keep this digital copy for campus verification.\n\nIssued by Order of Principal Dr. V. K. Malhotra\nAgragati Academy • Academic Administration`;

    setPreviewDoc({
      isOpen: true,
      title: "Official Academy Circular",
      fileName: `${safeTitle}_Circular.pdf`,
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

  const handleDownloadExcursionConsent = (notice: StudentBulletinItem) => {
    const content = `=== AGRAGATI ACADEMY • ISRO STUDY TOUR CONSENT & ITINERARY FORM ===\nStudent: Aarav Sharma (Class 12-A, Roll: ADM-2024-001)\nEvent: ISRO Space Applications Centre Study Tour\nDate of Departure: 2025-02-15\nLocation: ISRO Space Applications Centre, SAC Ahmedabad / ISRO HQ\nHouse: Tagore House | Housemaster: Prof. Rajesh Verma\n\nPARENTAL CONSENT DECLARATION:\n"I hereby grant permission for Aarav Sharma to participate in the scientific study tour conducted by Agragati Academy."\n\nParent Signature: _______________________\nEmergency Contact: +91 98765 43210\nMedical Declaration: No acute conditions on record.`;

    setPreviewDoc({
      isOpen: true,
      title: "ISRO Study Tour Consent & Itinerary Slip",
      fileName: "ISRO_Tour_Parental_Consent_Form.pdf",
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

  const handleAcknowledge = (id: string) => {
    if (!acknowledgedIds.includes(id)) {
      setAcknowledgedIds((prev) => [...prev, id]);
      showAlert("Notice marked as read & acknowledged.");
    }
  };

  const filteredNotices = notices.filter((n) => {
    const matchesCategory = categoryFilter === "ALL" || n.category === categoryFilter;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AppShell
      role="STUDENT"
      userName="Aarav Sharma"
      userRoleTitle="SCHOLAR • CLASS 12-A (SCIENCE & AI) • TAGORE HOUSE"
      epochText="Official Academy Bulletins • Michaelmas & CBSE Term 2024–2025"
    >
      <div className="space-y-6">
        {/* Toast Alert Feedback */}
        {alertMessage && (
          <div className="fixed top-5 right-5 z-50 bg-stone-900/95 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-500/40 animate-in fade-in slide-in-from-top-4 duration-200">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-sans text-xs font-semibold">{alertMessage}</span>
          </div>
        )}

        {/* Header with Quote Card & Academy Tower Sketch */}
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          {/* Subtle Tower Sketch Background in Upper Right */}
          <div className="absolute right-64 -top-4 pointer-events-none opacity-[0.14] hidden lg:block">
            <svg
              className="w-36 h-36 text-amber-800"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            >
              <polygon points="50,10 40,40 60,40" />
              <rect x="42" y="40" width="16" height="40" />
              <line x1="20" y1="80" x2="80" y2="80" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                ACADEMY CIRCULARS &amp; HOUSE BULLETINS
              </span>
              <span className="text-stone-300 text-xs">•</span>
              <span className="font-sans text-[10px] font-medium text-stone-500">
                {notices.length} Active Bulletins
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-stone-900">
              Notices &amp; House Circulars
            </h1>
            <p className="font-sans text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Official school announcements, Tagore House fixtures, excursion briefing guidelines, and Science &amp; ATL Society colloquia.
            </p>
          </div>

          {/* Right Quote Card */}
          <div className="bg-[#FFFDF9] border border-amber-200/70 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs shrink-0 self-start lg:self-center z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="font-serif italic text-xs text-stone-700 leading-snug">
                &ldquo;Stay informed. <br />Be involved. <br />Make a difference.&rdquo;
              </p>
              <div className="w-8 h-0.5 bg-amber-400 rounded-full mt-1.5" />
            </div>
          </div>
        </div>

        {/* Search & Category Filters Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "ALL", label: "All Bulletins", icon: null },
              { id: "EXCURSION", label: "Excursions & Tours", icon: <Plane className="w-3.5 h-3.5" /> },
              { id: "HOUSE", label: "Tagore House", icon: <Home className="w-3.5 h-3.5" /> },
              { id: "SOCIETY", label: "Clubs & Societies", icon: <Users className="w-3.5 h-3.5" /> },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  categoryFilter === cat.id
                    ? "bg-[#8B5E34] text-white shadow-xs"
                    : "bg-white border border-stone-200/80 text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="relative self-start sm:self-auto w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search circulars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-stone-200/80 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>
        </div>

        {/* Notices Feed Cards */}
        <div className="space-y-4 font-sans">
          {filteredNotices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-2">
              <Bell className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="font-serif text-lg font-bold text-stone-800">No circulars match your search</p>
              <p className="font-sans text-xs text-stone-500">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            filteredNotices.map((notice) => {
              const isAcknowledged = acknowledgedIds.includes(notice.id);

              return (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className="bg-white rounded-2xl border border-stone-200/80 p-5 md:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start justify-between gap-5 hover:border-amber-300/80 transition-all group cursor-pointer"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Category Icon Box */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        notice.category === "EXCURSION"
                          ? "bg-sky-100 text-sky-700 border border-sky-200/70"
                          : notice.category === "HOUSE"
                          ? "bg-amber-100 text-amber-800 border border-amber-200/70"
                          : "bg-emerald-100 text-emerald-700 border border-emerald-200/70"
                      }`}
                    >
                      {notice.category === "EXCURSION" ? (
                        <Rocket className="w-7 h-7" />
                      ) : notice.category === "HOUSE" ? (
                        <Home className="w-7 h-7" />
                      ) : (
                        <Users className="w-7 h-7" />
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      {/* Badges & Date */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            notice.category === "EXCURSION"
                              ? "bg-sky-100 text-sky-800"
                              : notice.category === "HOUSE"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {notice.category}
                        </span>

                        {notice.priority === "URGENT" && (
                          <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold uppercase">
                            MANDATORY BRIEFING
                          </span>
                        )}

                        {isAcknowledged && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Read
                          </span>
                        )}

                        <span className="text-xs text-stone-500 font-mono ml-auto flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-stone-400" />
                          {notice.date}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif text-base md:text-lg font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                        {notice.title}
                      </h3>

                      {/* Body */}
                      <p className="font-sans text-xs text-stone-500 leading-relaxed max-w-4xl">
                        {notice.body}
                      </p>

                      {/* Footer Author */}
                      <div className="pt-2 flex items-center gap-1.5 text-xs text-stone-600 font-medium">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        <span>Posted by: <strong>{notice.author}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Download & Arrow Actions */}
                  <div className="flex items-center gap-3 self-end md:self-center shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={(e) => handleDownloadCircular(notice, e)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/80 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Download full circular PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-700" />
                      <span>Circular (PDF)</span>
                    </button>
                    <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-amber-700 transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Motivational Banner */}
        <div className="bg-white rounded-2xl border border-amber-200/70 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="absolute right-24 -bottom-4 pointer-events-none opacity-20 hidden md:block">
            <svg
              className="w-48 h-32 text-amber-800"
              viewBox="0 0 200 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            >
              <polygon points="100,10 90,40 110,40" />
              <rect x="85" y="40" width="30" height="60" />
              <rect x="50" y="60" width="35" height="40" />
              <rect x="115" y="60" width="35" height="40" />
              <line x1="20" y1="95" x2="180" y2="95" />
            </svg>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg md:text-xl font-bold text-stone-900">
                More than a Student. <br className="hidden sm:inline" />
                A Part of Something Greater.
              </h3>
              <div className="w-12 h-1 bg-amber-400 rounded-full mt-2" />
            </div>
          </div>

          <div className="text-right relative z-10">
            <p className="font-serif italic text-sm text-stone-700">
              Ideas today. <br />
              Leaders tomorrow.
            </p>
          </div>
        </div>

        {/* Notice Inspection Modal */}
        <Modal
          isOpen={!!selectedNotice}
          onClose={() => setSelectedNotice(null)}
          title="Official Academy Bulletin"
          description="Institutional announcement details, circular protocols, and downloadable forms."
          maxWidth="lg"
        >
          {selectedNotice && (
            <div className="space-y-6 font-sans text-xs">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold uppercase">
                      {selectedNotice.category}
                    </span>
                    {selectedNotice.priority === "URGENT" && (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold uppercase">
                        MANDATORY BRIEFING
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-stone-500 text-xs flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedNotice.date}
                  </span>
                </div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  {selectedNotice.title}
                </h3>
                <p className="text-stone-500 text-xs">
                  Authority: <strong className="text-stone-800">{selectedNotice.author}</strong>
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-stone-900 text-xs uppercase tracking-wider">
                  Full Announcement &amp; Instructions:
                </h4>
                <div className="p-4 bg-white rounded-xl border border-stone-200/80 leading-relaxed text-stone-700 space-y-2 text-xs">
                  <p>{selectedNotice.body}</p>
                  <p className="text-stone-500 italic pt-2 border-t border-stone-100">
                    &ldquo;{selectedNotice.summary}&rdquo;
                  </p>
                </div>
              </div>

              {/* Excursion specific actions */}
              {selectedNotice.category === "EXCURSION" && (
                <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Plane className="w-5 h-5 text-sky-700 shrink-0" />
                    <div>
                      <span className="font-semibold text-sky-950 block">Tour Itinerary &amp; Parent Consent Form</span>
                      <span className="text-[11px] text-sky-700">Required prior to departure briefing.</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadExcursionConsent(selectedNotice)}
                    className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Form (PDF)</span>
                  </button>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => handleDownloadCircular(selectedNotice)}
                  className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-800" />
                  <span>Download Circular (PDF)</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleAcknowledge(selectedNotice.id);
                      setSelectedNotice(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Acknowledge Notice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedNotice(null)}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50"
                  >
                    Close
                  </button>
                </div>
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

