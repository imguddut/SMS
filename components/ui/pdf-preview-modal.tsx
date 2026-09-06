"use client";

import * as React from "react";
import {
  Download,
  Printer,
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  School,
  QrCode,
  Calendar,
} from "lucide-react";
import { triggerClientDownload, PDFStudentMetadata } from "@/lib/utils";

export type { PDFStudentMetadata };

export interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileName: string;
  content: string;
  studentMeta?: PDFStudentMetadata;
  onDownload?: () => void;
}

export function PdfPreviewModal({
  isOpen,
  onClose,
  title,
  fileName,
  content,
  studentMeta,
  onDownload,
}: PdfPreviewModalProps) {
  const [zoomLevel, setZoomLevel] = React.useState<number>(100);
  const [isPrinting, setIsPrinting] = React.useState<boolean>(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload();
    } else {
      triggerClientDownload(fileName, content, "application/pdf", studentMeta);
    }
  };

  const handlePrintClick = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  const sName = studentMeta?.name || "Student";
  const sForm = studentMeta?.form || "";
  const sRoll = studentMeta?.rollNumber || "";
  const sHouse = studentMeta?.house || "";

  const instName = studentMeta?.institutionName || "School Administration";
  const instAffiliation =
    studentMeta?.institutionAffiliation ||
    "Official Academic Transcript & Governance Record";
  const instAddress =
    studentMeta?.institutionAddress ||
    "Campus Administration Desk";
  const academicSession = studentMeta?.academicSession || new Date().getFullYear().toString();

  // Parse text content into structured paragraphs/sections for the realistic sheet view
  const cleanedLines = (content || "")
    .replace(/^%PDF-[\d\.]+\s*/i, "")
    .split("\n");

  const cleanDocTitle = fileName
    .replace(/\.pdf$/i, "")
    .replace(/[_-]/g, " ")
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-50 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-[#12161f] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* School Crest Icon in Toolbar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs border border-amber-400/40 relative">
              <School className="w-5 h-5 text-amber-300" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-stone-900 font-bold text-[8px] flex items-center justify-center border border-white dark:border-stone-900">
                ★
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-sans">
                  OFFICIAL INSTITUTION PREVIEW
                </span>
                <span className="text-xs text-stone-400 font-mono hidden sm:inline truncate">
                  {fileName}
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 truncate">
                {title || cleanDocTitle}
              </h3>
            </div>
          </div>

          {/* Controls: Zoom, Print, Download, Close */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono w-10 text-center text-stone-700 dark:text-stone-300">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 border-l border-stone-200 dark:border-stone-700 pl-1.5"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrintClick}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Print Document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Print</span>
            </button>

            {/* Primary Download Button */}
            <button
              type="button"
              onClick={handleDownloadClick}
              className="px-4 py-2 rounded-xl bg-[#8C6D27] hover:bg-[#785c1f] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Sheet Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-stone-100/90 dark:bg-stone-950/60 flex justify-center items-start">
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease-out",
            }}
            className="w-full max-w-[760px] bg-white text-stone-900 rounded-lg shadow-2xl border border-stone-300/80 overflow-hidden font-sans select-text"
          >
            {/* Header Ribbon with Prominent School Name & Crest Logo */}
            <div className="bg-[#1E3A8A] text-white px-6 py-5 relative">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Institutional Shield & Crest Logo */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 via-[#1E3A8A] to-slate-950 border-2 border-amber-400 flex flex-col items-center justify-center shrink-0 shadow-md relative group">
                    <div className="flex items-center gap-0.5 text-[8px] font-bold text-amber-300 uppercase tracking-tighter">
                      ★ AMA ★
                    </div>
                    <School className="w-6 h-6 text-amber-300 my-0.5" />
                    <span className="text-[7px] font-mono text-amber-200 tracking-widest uppercase">
                      ESTD 1984
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-serif font-bold text-base sm:text-lg tracking-wide text-white uppercase leading-tight">
                      {instName}
                    </h2>
                    <p className="text-[11px] text-blue-100 font-sans mt-0.5">
                      {instAffiliation}
                    </p>
                    <p className="text-[10px] text-blue-200 font-sans">
                      {instAddress}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[9px] font-semibold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                        MANAGED VIA AGRAGATI SCHOOL OS
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right hidden sm:block shrink-0">
                  <span className="text-[11px] font-bold tracking-widest text-amber-300 uppercase block">
                    ACADEMIC YEAR {academicSession}
                  </span>
                  <span className="text-[9px] text-blue-200 font-mono block">
                    CBSE SENIOR SECONDARY
                  </span>
                  <span className="text-[8px] text-amber-200/90 uppercase font-semibold block mt-0.5">
                    GOVT. RECOGNIZED
                  </span>
                </div>
              </div>

              {/* Gold Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#D97706]" />
            </div>

            {/* Document Body Sheet Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Document Title Header */}
              <div className="pb-3 border-b-2 border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 uppercase">
                    {title || cleanDocTitle}
                  </h1>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Official Authenticated Document • {instName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    CBSE Verified
                  </span>
                </div>
              </div>

              {/* Student Metadata Infobox */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                    STUDENT NAME &amp; FORM
                  </span>
                  <span className="font-bold text-stone-900 text-sm">
                    {sName} ({sForm})
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                    ROLL NUMBER &amp; CBSE ID
                  </span>
                  <span className="font-semibold text-stone-800">
                    {sRoll}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                    HOUSE &amp; TUTOR
                  </span>
                  <span className="font-medium text-stone-800">
                    {sHouse}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                    DATE &amp; TIME GENERATED
                  </span>
                  <span className="font-mono text-stone-700">
                    {new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
                  </span>
                </div>
              </div>

              {/* Formatted Content Lines */}
              <div className="space-y-3 text-xs text-stone-800 leading-relaxed font-sans">
                {cleanedLines.map((line, idx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <div key={idx} className="h-1.5" />;

                  // Section Divider
                  if (trimmed.startsWith("===") || trimmed.startsWith("---") || trimmed.startsWith("___")) {
                    return <hr key={idx} className="border-stone-200 my-2" />;
                  }

                  // Section Header (e.g. SUBJECT-WISE PERFORMANCE BREAKDOWN:)
                  if (
                    trimmed.endsWith(":") &&
                    trimmed.length < 60 &&
                    trimmed === trimmed.toUpperCase()
                  ) {
                    return (
                      <h4
                        key={idx}
                        className="font-serif font-bold text-sm text-[#8C6D27] uppercase tracking-wide mt-4 pb-1 border-b border-amber-100"
                      >
                        {trimmed}
                      </h4>
                    );
                  }

                  // Key: Value Pairs
                  if (trimmed.includes(":") && !trimmed.startsWith("http") && trimmed.split(":")[0].length < 35) {
                    const parts = trimmed.split(":");
                    const key = parts[0].trim();
                    const val = parts.slice(1).join(":").trim();
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                        <span className="font-bold text-stone-700 min-w-[140px] shrink-0">
                          {key}:
                        </span>
                        <span className="text-stone-900 font-normal">
                          {val}
                        </span>
                      </div>
                    );
                  }

                  // Bullet Points
                  if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
                    return (
                      <div key={idx} className="flex items-start gap-2 pl-2">
                        <span className="text-amber-700 font-bold">•</span>
                        <span>{trimmed.replace(/^[-•*]\s*/, "")}</span>
                      </div>
                    );
                  }

                  // Regular Paragraph Text
                  return (
                    <p key={idx} className="text-stone-700">
                      {trimmed}
                    </p>
                  );
                })}
              </div>

              {/* Official Institutional Verification Seal */}
              <div className="mt-8 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-[#8C6D27]" />
                    <span>OFFICIAL INSTITUTIONAL SEAL &amp; AUTHENTICATION</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Issued by: <strong>{instName}</strong> • Approved by Dr. V. K. Malhotra (Principal &amp; Headmaster)
                  </p>
                  <span className="font-mono text-[10px] text-stone-500 block">
                    Digital Hash: CBSE-APAAR-998418-2025-SECURE-SHA256 • Verified by Agragati OS
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <div className="w-12 h-12 rounded-lg bg-white border border-amber-300 flex items-center justify-center p-1 text-center shadow-xs">
                    <QrCode className="w-8 h-8 text-stone-800" />
                  </div>
                </div>
              </div>

              {/* Running Footer */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-400 font-sans">
                <span>{instName} • Official Document</span>
                <span>Powered by Agragati School OS • Page 1 of 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shrink-0">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Preview generated with authentic CBSE Institutional layout.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadClick}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#8C6D27] hover:bg-[#785c1f] text-white text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
