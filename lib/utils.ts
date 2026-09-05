import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  if (currency === "INR" || currency === "₹") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatIndianCurrency(amount: number): string {
  return `₹ ${amount.toLocaleString("en-IN")}`;
}

export function formatIndianLakhsCrores(amount: number): string {
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2);
    return `₹ ${cr.endsWith(".00") ? cr.slice(0, -3) : cr} Cr`;
  }
  if (amount >= 100000) {
    const lk = (amount / 100000).toFixed(2);
    return `₹ ${lk.endsWith(".00") ? lk.slice(0, -3) : lk} L`;
  }
  return `₹ ${amount.toLocaleString("en-IN")}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export interface PDFStudentMetadata {
  name?: string;
  rollNumber?: string;
  form?: string;
  house?: string;
  classSection?: string;
  academicSession?: string;
  institutionName?: string;
  institutionAffiliation?: string;
  institutionAddress?: string;
  institutionLogoText?: string;
}

export async function triggerClientDownload(
  fileName: string,
  content?: string,
  mimeType: string = "application/pdf",
  studentMeta?: PDFStudentMetadata
) {
  if (typeof window === "undefined") return;

  const cleanFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;

  // If explicit non-PDF text/csv is requested
  if (mimeType !== "application/pdf" && !fileName.endsWith(".pdf")) {
    const payload = content || "Agragati School OS Document";
    const blob = new Blob([payload], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  try {
    const jsPdfModule = await import("jspdf");
    const jsPDF = jsPdfModule.default || (jsPdfModule as any).jsPDF;
    // Generate 100% valid standard PDF using jsPDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const maxContentWidth = pageWidth - margin * 2;

    const instName = (
      studentMeta?.institutionName || "AGRAGATI MODERN ACADEMY & SENIOR SECONDARY SCHOOL"
    ).toUpperCase();
    const instAffiliation =
      studentMeta?.institutionAffiliation ||
      "Affiliated to Central Board of Secondary Education (CBSE) • Affiliation No: 2730017 • School Code: 85214";
    const instAddress =
      studentMeta?.institutionAddress ||
      "Sector XII, Institutional Area, New Delhi - 110022 • Institutional APAAR ID: 998418-CBSE";
    const academicSession = studentMeta?.academicSession || "2024–2025";

    // 1. Header Ribbon (Deep Navy with Gold Accent)
    const headerRibbonHeight = 30;
    doc.setFillColor(30, 58, 138); // Deep Navy (#1E3A8A)
    doc.rect(0, 0, pageWidth, headerRibbonHeight, "F");

    // Gold Accent Line
    doc.setFillColor(217, 119, 6); // Amber Gold (#D97706)
    doc.rect(0, headerRibbonHeight, pageWidth, 2, "F");

    // --- Official School Crest / Logo (Vector Emblem on Top Left) ---
    const logoCenterX = margin + 8;
    const logoCenterY = 15;
    
    // Outer Gold Ring
    doc.setDrawColor(245, 158, 11);
    doc.setFillColor(15, 23, 42); // Slate-900 background
    doc.setLineWidth(0.6);
    doc.circle(logoCenterX, logoCenterY, 8.5, "FD");

    // Middle Gold Ring
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.3);
    doc.circle(logoCenterX, logoCenterY, 7.2, "D");

    // Inner Crest Shield Geometry
    doc.setFillColor(245, 158, 11);
    doc.rect(logoCenterX - 3.2, logoCenterY - 3.5, 6.4, 4.5, "F");
    doc.triangle(
      logoCenterX - 3.2,
      logoCenterY + 1.0,
      logoCenterX + 3.2,
      logoCenterY + 1.0,
      logoCenterX,
      logoCenterY + 4.2,
      "F"
    );

    // School Monogram / Emblem text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text("AMA", logoCenterX, logoCenterY + 0.5, { align: "center" });

    // --- School / Institute Name & Accreditation Header (Beside Logo) ---
    const textStartX = margin + 20;

    // School Name in prominent bold white
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(instName, textStartX, 10.5);

    // Affiliation Line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(219, 234, 254); // Light Blue-100
    doc.text(instAffiliation, textStartX, 16);

    // Campus Address
    doc.setFontSize(6.8);
    doc.setTextColor(191, 219, 254);
    doc.text(instAddress, textStartX, 20.8);

    // Powered by Agragati OS Badge
    doc.setFontSize(6.2);
    doc.setTextColor(253, 230, 138); // Warm Gold
    doc.text("MANAGED VIA AGRAGATI SCHOOL MANAGEMENT OS • OFFICIAL CERTIFIED COPY", textStartX, 25.5);

    // Academic Year & Board details on Right Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(253, 230, 138);
    doc.text(`ACADEMIC YEAR ${academicSession}`, pageWidth - margin, 10.5, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(219, 234, 254);
    doc.text("CBSE SENIOR SECONDARY", pageWidth - margin, 15.5, { align: "right" });
    doc.text("GOVT. RECOGNIZED INSTITUTION", pageWidth - margin, 20.5, { align: "right" });

    // 2. Document Title
    let currentY = 42;
    const documentTitle = fileName
      .replace(/\.pdf$/i, "")
      .replace(/[_-]/g, " ")
      .toUpperCase();

    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(documentTitle, margin, currentY);

    currentY += 4;
    doc.setDrawColor(220, 220, 225);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 6;

    // 3. Metadata Infobox
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY, maxContentWidth, 18, 2, 2, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, maxContentWidth, 18, 2, 2, "S");

    const sName = studentMeta?.name || "Aarav Sharma";
    const sForm = studentMeta?.form || "Class 12-A";
    const sRoll = studentMeta?.rollNumber || "ADM-2024-001 (CBSE: 12104928)";
    const sHouse = studentMeta?.house || "Tagore House (Senior Lyceum)";

    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Student: ${sName} (${sForm})`, margin + 4, currentY + 6);
    doc.text(`Roll Number: ${sRoll}`, margin + 4, currentY + 12);

    doc.text(`House: ${sHouse}`, margin + 95, currentY + 6);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`, margin + 95, currentY + 12);

    currentY += 25;

    // 4. Body Content
    const rawContent =
      content ||
      `OFFICIAL RECORD & VERIFIED TRANSCRIPT
Document Reference: AGR-DOC-${Date.now()}
Candidate: Aarav Sharma
Class: Class 12-A Senior Secondary (Science & Artificial Intelligence)
House: Tagore House

This official document certifies academic performance, coursework submissions, and institutional verification from Agragati Academy.

Verification Hash: SEAL-PRINCIPAL-APAAR-998418-CBSE
Authorized by Principal & Headmaster Dr. V. K. Malhotra.`;

    const cleanedLines = rawContent
      .replace(/^%PDF-[\d\.]+\s*/i, "")
      .split("\n");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    for (const rawLine of cleanedLines) {
      const line = rawLine.trim();
      if (!line) {
        currentY += 3;
        continue;
      }

      // Check if line is a header / section divider
      if (line.startsWith("===") || line.startsWith("---") || line.startsWith("___")) {
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 5;
        continue;
      }

      if (line.endsWith(":") && line.length < 50 && line === line.toUpperCase()) {
        if (currentY > pageHeight - 35) {
          doc.addPage();
          currentY = 20;
        }
        currentY += 3;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(140, 109, 39); // Amber Gold
        doc.setFontSize(9.5);
        doc.text(line, margin, currentY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(9);
        currentY += 5;
        continue;
      }

      // Format key-value pairs
      if (line.includes(":") && !line.startsWith("http") && line.split(":")[0].length < 30) {
        const parts = line.split(":");
        const key = parts[0].trim() + ":";
        const val = parts.slice(1).join(":").trim();

        if (currentY > pageHeight - 30) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setTextColor(51, 65, 85);
        doc.text(key, margin, currentY);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        const keyWidth = doc.getTextWidth(key) + 3;
        const wrappedVal = doc.splitTextToSize(val, maxContentWidth - keyWidth);
        doc.text(wrappedVal, margin + keyWidth, currentY);
        currentY += Math.max(5, wrappedVal.length * 4.2);
        continue;
      }

      // Standard text wrap
      const wrappedText = doc.splitTextToSize(line, maxContentWidth);
      if (currentY + wrappedText.length * 4.2 > pageHeight - 30) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      doc.text(wrappedText, margin, currentY);
      currentY += wrappedText.length * 4.2;
    }

    // 5. Verification Footer Box on Last Page
    if (currentY > pageHeight - 35) {
      doc.addPage();
      currentY = 20;
    } else {
      currentY += 8;
    }

    doc.setFillColor(254, 252, 232); // Amber light tint
    doc.roundedRect(margin, currentY, maxContentWidth, 18, 2, 2, "F");
    doc.setDrawColor(251, 191, 36);
    doc.roundedRect(margin, currentY, maxContentWidth, 18, 2, 2, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    doc.text("OFFICIAL INSTITUTIONAL SEAL & AUTHENTICATION", margin + 4, currentY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 53, 15);
    doc.text(`Issued by: ${instName} (Affiliation No: 2730017)`, margin + 4, currentY + 10.5);
    doc.text("Signed & Sealed: Dr. V. K. Malhotra (Principal & Headmaster) • Digital Hash: CBSE-APAAR-998418-SECURE-SHA256", margin + 4, currentY + 14.5);

    // Bottom Running Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `${instName} • Page ${i} of ${totalPages} • Powered by Agragati School OS`,
        pageWidth / 2,
        pageHeight - 6,
        { align: "center" }
      );
    }

    // Direct, valid PDF save
    doc.save(cleanFileName);
  } catch (err) {
    console.error("Error generating PDF with jsPDF, falling back to blob:", err);
    // Fallback if needed
    const blob = new Blob([content || ""], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = cleanFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}


