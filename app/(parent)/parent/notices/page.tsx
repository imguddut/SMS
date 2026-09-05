"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Modal } from "@/components/ui/modal";
import {
  fetchParentBulletins,
  signNoticeConsent,
  ParentNoticeItem,
} from "@/lib/db/parent";
import {
  CheckCircle2,
  Building2,
  Sparkles,
  Plane,
  GraduationCap,
  Bus,
  ShieldCheck,
  PenTool,
  ArrowRight,
  Shield,
  FileCheck2,
  Download,
  Eye,
} from "lucide-react";
import { PdfPreviewModal } from "@/components/ui/pdf-preview-modal";

export default function ParentNoticesPage() {
  const [bulletins, setBulletins] = React.useState<ParentNoticeItem[]>([]);
  const [categoryFilter, setCategoryFilter] = React.useState("ALL");
  const [isLoading, setIsLoading] = React.useState(true);
  const [previewDoc, setPreviewDoc] = React.useState<{
    isOpen: boolean;
    title: string;
    fileName: string;
    content: string;
    studentMeta?: { name?: string; form?: string; rollNumber?: string; house?: string };
  } | null>(null);

  // Consent Signature Modal
  const [selectedNotice, setSelectedNotice] = React.useState<ParentNoticeItem | null>(null);
  const [isSigning, setIsSigning] = React.useState(false);
  const [signSuccess, setSignSuccess] = React.useState(false);
  const [consentAcknowledged, setConsentAcknowledged] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchParentBulletins();
        setBulletins(data);
      } catch (err) {
        console.error("Failed to load bulletins", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDownloadCircular = (notice: ParentNoticeItem) => {
    const content = `OFFICIAL SCHOOL CIRCULAR & ADMINISTRATIVE NOTICE
Circular Reference: AGR-CIRC-${notice.id.toUpperCase()}-${notice.date.replace(/[^0-9]/g, "")}
Issue Date: ${notice.date}
Category: ${notice.category}
Issuing Authority: ${notice.sender}

SUBJECT:
${notice.title}

CIRCULAR DETAILS & FULL ANNOUNCEMENT:
${notice.body}

ADMINISTRATIVE GUIDELINES:
1. Parents and guardians are requested to take note of the above circular.
2. For student transport route adjustments, contact the School Transport Helpdesk (+91 11 2617 8812).
3. Inquiries regarding academic excursions may be directed to the Activity In-Charge.

Authorized By: ${notice.sender}
Principal & Headmaster Dr. V. K. Malhotra • Agragati Academy New Delhi`;

    setPreviewDoc({
      isOpen: true,
      title: `School Circular • ${notice.title}`,
      fileName: `Circular_${notice.category}_${notice.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30)}.pdf`,
      content,
      studentMeta: {
        name: "Aarav Sharma",
        form: "Class 12-A",
        rollNumber: "ADM-2024-001",
        house: "Tagore House",
      },
    });
  };

  const handleDownloadSignedConsent = (notice: ParentNoticeItem) => {
    const content = `OFFICIAL PARENTAL PERMISSION & CONSENT SLIP
Activity: ${notice.title}
Notice ID: ${notice.id.toUpperCase()}
Issued By: ${notice.sender}
Notice Date: ${notice.date}

STUDENT PARTICULARS:
Student Name: Aarav Sharma
Class & Section: Class 12-A
Roll Number: ADM-2024-001 (CBSE: 12104928)
House: Tagore House

PARENT DECLARATION & ELECTRONIC SIGNATURE:
Parent Name: Mr. Rajesh Sharma
Signed Date: ${notice.signedDate || new Date().toISOString().split("T")[0]}
Status: CONSENT GRANTED & DIGITALLY VERIFIED

"I hereby confirm that I have read and agreed to the guidelines for ${notice.title}. I grant permission for my ward Aarav Sharma to participate under the supervision of school faculty."

Verification Seal: SEAL-CBSE-CONSENT-APPROVED-2025`;

    setPreviewDoc({
      isOpen: true,
      title: `Signed Parental Permission • ${notice.title}`,
      fileName: `Signed_Consent_${notice.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30)}.pdf`,
      content,
      studentMeta: {
        name: "Aarav Sharma",
        form: "Class 12-A",
        rollNumber: "ADM-2024-001",
        house: "Tagore House",
      },
    });
  };

  const handleSignConsent = async (notice: ParentNoticeItem) => {
    if (!consentAcknowledged) return;
    setIsSigning(true);
    try {
      const res = await signNoticeConsent(notice.id);
      setBulletins((prev) =>
        prev.map((b) =>
          b.id === notice.id
            ? { ...b, isSigned: true, signedDate: res.signedDate }
            : b
        )
      );
      setSignSuccess(true);
      setTimeout(() => {
        setSignSuccess(false);
        setSelectedNotice(null);
        setConsentAcknowledged(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigning(false);
    }
  };

  const filteredBulletins = bulletins.filter((b) => {
    if (categoryFilter === "ALL") return true;
    return b.category === categoryFilter;
  });

  const getNoticeMeta = (category: string) => {
    switch (category) {
      case "EXCURSION":
        return {
          categoryLabel: "SCHOOL TRIP",
          border: "border-l-4 border-l-[#E11D48]",
          iconBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40",
          icon: <Plane className="w-5 h-5" />,
        };
      case "ACADEMIC":
        return {
          categoryLabel: "ACADEMIC",
          border: "border-l-4 border-l-[#3B82F6]",
          iconBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40",
          icon: <GraduationCap className="w-5 h-5" />,
        };
      case "BOARDING":
      default:
        return {
          categoryLabel: "TRANSPORT",
          border: "border-l-4 border-l-[#10B981]",
          iconBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40",
          icon: <Bus className="w-5 h-5" />,
        };
    }
  };

  return (
    <AppShell
      role="PARENT"
      userName="Mr. Rajesh Sharma"
      userRoleTitle="Parent • Aarav Sharma (Class 12-A)"
      epochText="Academic Year 2024–2025 • Term 2 (CBSE Board)"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-[#8C6D27] uppercase font-sans">
                  SCHOOL NOTICES &amp; CIRCULARS
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  {bulletins.length} Active Circulars
                </span>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                School Notices &amp; Circulars
              </h1>
              <p className="font-sans text-xs md:text-sm text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
                Official school announcements, event invitations, bus route updates, and parent permission forms.
              </p>
            </div>

            {/* Emblem / Motto Card on Right */}
            <div className="p-3.5 bg-amber-50/50 dark:bg-stone-900/50 border border-amber-200/60 dark:border-amber-900/40 rounded-xl flex items-center gap-3 self-start lg:self-center shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#8C6D27]/10 dark:bg-[#8C6D27]/20 text-[#8C6D27] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-serif italic text-xs text-stone-800 dark:text-stone-200 leading-snug">
                  &ldquo;Stay informed. Stay involved. A brighter tomorrow together.&rdquo;
                </p>
                <span className="text-[10px] font-sans font-bold text-stone-500 dark:text-stone-400 block mt-0.5">
                  Agragati Parent Desk
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Category Filter Buttons */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {[
            { id: "ALL", label: `All Notices (${bulletins.length})`, icon: null },
            { id: "EXCURSION", label: "School Trips & Tours", icon: <Plane className="w-3.5 h-3.5" /> },
            { id: "ACADEMIC", label: "Academic & Events", icon: <GraduationCap className="w-3.5 h-3.5" /> },
            { id: "BOARDING", label: "Bus & Transport", icon: <Bus className="w-3.5 h-3.5" /> },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                categoryFilter === cat.id
                  ? "bg-[#8C6D27] text-white shadow-xs"
                  : "bg-white dark:bg-[#151922] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-800"
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Bulletins Feed Cards */}
        <div className="space-y-4">
          {filteredBulletins.map((notice) => {
            const meta = getNoticeMeta(notice.category);
            return (
              <div
                key={notice.id}
                className={`bg-white dark:bg-[#151922] rounded-2xl border border-stone-200/80 dark:border-stone-800 ${meta.border} p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                  {/* Left Circle Icon */}
                  <div className={`w-11 h-11 rounded-full border flex items-center justify-center shrink-0 ${meta.iconBg}`}>
                    {meta.icon}
                  </div>

                  {/* Center Content */}
                  <div className="flex-1 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {meta.categoryLabel}
                        </span>
                        {notice.priority === "URGENT" && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                            Action Required
                          </span>
                        )}
                        <span className="text-xs text-stone-400 font-mono">
                          {notice.date}
                        </span>
                      </div>

                      {/* Right Tag */}
                      {notice.requiresConsent ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-amber-950/50 text-[#B45309] dark:text-amber-300">
                          Parent Permission Required
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                          General Notice
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                      {notice.title}
                    </h3>

                    <p className="font-sans text-xs text-stone-600 dark:text-stone-300 max-w-4xl leading-relaxed">
                      {notice.body}
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100 dark:border-stone-800/80">
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <Building2 className="w-3.5 h-3.5 text-[#8C6D27]" />
                        <span>
                          Issued by: <strong className="text-stone-700 dark:text-stone-300 font-medium">{notice.sender}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadCircular(notice)}
                          title="Download Official Circular (PDF)"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1a1f2c] text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-semibold transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-[#8C6D27]" />
                          <span className="hidden sm:inline">Circular PDF</span>
                        </button>

                        {notice.requiresConsent ? (
                          notice.isSigned ? (
                            <button
                              type="button"
                              onClick={() => handleDownloadSignedConsent(notice)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#DCFCE7] dark:bg-emerald-950/50 text-[#15803D] dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Permission Signed ({notice.signedDate || "2025-01-12"})</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedNotice(notice)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#be123c] text-white text-xs font-bold transition-all shadow-xs"
                            >
                              <span>Review &amp; Sign Permission</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDownloadCircular(notice)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1a1f2c] text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-semibold transition-colors"
                          >
                            <span>Read Notice Details</span>
                            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                          </button>
                        )}
                      </div>
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
              <span className="text-[10px] font-bold tracking-widest text-[#8C6D27] uppercase font-sans block">
                AGRAGATI PARENT ENGAGEMENT
              </span>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                Knowledge builds brighter futures.
              </h3>
              <p className="font-serif italic text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                &ldquo;Informed parents help children do better in school.&rdquo;
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-xs text-stone-500 dark:text-stone-400 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Direct School Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#8C6D27]" />
              <span>SMS &amp; Email Alerts</span>
            </div>
          </div>
        </div>

        {/* Electronic Consent Modal */}
        <Modal
          isOpen={!!selectedNotice}
          onClose={() => setSelectedNotice(null)}
          title="Parent Permission Form (Consent Slip)"
          description="Granting parental permission for student participation in educational visit."
          maxWidth="lg"
        >
          {selectedNotice && (
            <div className="space-y-5">
              {signSuccess ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                    Permission Slip Submitted
                  </h3>
                  <p className="font-sans text-xs text-stone-500 dark:text-stone-400">
                    Your consent has been officially recorded with the School Office.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadSignedConsent(selectedNotice)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8C6D27] text-white text-xs font-bold hover:bg-[#785c1f] transition-all shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Signed Consent Slip (PDF)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
                    <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                      {selectedNotice.title}
                    </h4>
                    <p className="font-sans text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                      {selectedNotice.body}
                    </p>
                  </div>

                  <div className="p-4 bg-white dark:bg-[#151922] rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 text-xs font-sans">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block uppercase tracking-wider text-[10px]">
                      Parent Declaration
                    </span>
                    <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
                      I hereby grant permission for my child Aarav Sharma (Class 12-A) to participate in the ISRO educational tour and authorize accompanying teachers in case of any medical need as per CBSE safety guidelines.
                    </p>
                  </div>

                  <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/80 dark:border-amber-900/40 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="consentCheck"
                      checked={consentAcknowledged}
                      onChange={(e) => setConsentAcknowledged(e.target.checked)}
                      className="w-4 h-4 rounded border-amber-300 text-[#8C6D27] focus:ring-[#8C6D27]"
                    />
                    <label htmlFor="consentCheck" className="text-xs text-stone-800 dark:text-stone-200 font-medium cursor-pointer">
                      I confirm and submit my digital signature as parent/guardian (Mr. Rajesh Sharma)
                    </label>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => handleDownloadCircular(selectedNotice)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1a1f2c] text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#8C6D27]" />
                      <span>Download Circular (PDF)</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedNotice(null)}
                        className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1a1f2c] text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!consentAcknowledged || isSigning}
                        onClick={() => handleSignConsent(selectedNotice)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8C6D27] hover:bg-[#785c1f] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isSigning ? "Submitting..." : "Submit Permission"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
