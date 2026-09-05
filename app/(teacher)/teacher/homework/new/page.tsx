"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Send,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  FileText,
  Scale,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Lightbulb,
  Target,
  ChevronDown,
  Info,
} from "lucide-react";
import { createHomeworkAssignment } from "@/lib/db/teacher";
import { PdfPreviewModal } from "@/components/ui/pdf-preview-modal";

export default function TeacherNewHomeworkPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const [formData, setFormData] = React.useState({
    title: "Application of Integrals & Differential Equations — CBSE Problem Set 4",
    className: "Class 12-A — Senior Secondary Mathematics",
    form: "Class 12-A",
    subject: "Mathematics (041)",
    dueDate: "2024-11-28",
    dueTime: "17:00 IST",
    maxMarks: 50,
    description:
      "Complete NCERT Exemplar exercises 8.1 through 8.4 on Area under Simple Curves, Differential Equations of First Order, and CBSE Sample Paper 2024–25 problem sets. Full mathematical proofs with explicit steps must be provided.",
    rubrics: [
      { id: 1, label: "Step-by-Step Integration Method", marks: 15, color: "blue" },
      { id: 2, label: "Differential Equation Particular Solution", marks: 20, color: "emerald" },
      { id: 3, label: "Notation & Final Answer Accuracy", marks: 15, color: "purple" },
    ],
  });

  const previewContent = `DELHI PUBLIC SCHOOL, R.K. PURAM
OFFICIAL ACADEMIC HOMEWORK DISPATCH & ASSESSMENT RUBRIC
Academic Session: 2024–2025 • Term 2 (CBSE Senior Secondary)

ASSIGNMENT METADATA:
Title: ${formData.title}
Subject: ${formData.subject}
Assigned To: ${formData.className}
Instructor: Prof. Rajesh Verma (Senior PGT Mathematics & Head of Department)
Assigned Date: ${new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
Submission Deadline: ${formData.dueDate}, ${formData.dueTime}
Maximum Marks: ${formData.maxMarks} Marks

INSTRUCTIONS & PROBLEM DESCRIPTIONS:
================================================================================
${formData.description}
================================================================================

ASSESSMENT RUBRIC & MARKING SCHEME:
================================================================================
${formData.rubrics.map((r, i) => `${i + 1}. ${r.label} (${r.marks} Marks)`).join("\n")}
================================================================================

SUBMISSION GUIDELINES:
- Solutions must be handwritten on standard A4 lined paper, scanned in high resolution (minimum 300 DPI), and uploaded as a single unified PDF file.
- Late submissions will be flagged and subject to penalty as per School Academic Policy.
- Plagiarism or generative AI reproduction will result in immediate disqualification.

Digital Verification Hash: DPS-RKP-HW-DISPATCH-2025-SECURE
Authorized by Faculty Coordinator: Prof. Rajesh Verma (PGT Mathematics)`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createHomeworkAssignment({
        title: formData.title,
        className: formData.className,
        form: formData.form,
        subject: formData.subject,
        dueDate: `${formData.dueDate}, ${formData.dueTime}`,
        maxMarks: Number(formData.maxMarks),
        description: formData.description,
        rubric: formData.rubrics.map((r) => `${r.id}. ${r.label} (${r.marks} marks)`).join("\n"),
      });
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      role="TEACHER"
      userName="Prof. Rajesh Verma"
      userRoleTitle="PGT Mathematics & Senior Coordinator"
      epochText="Daily Schedule • Term 2 (CBSE Board)"
    >
      <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
        {/* Top Back Link */}
        <div>
          <Link
            href="/teacher/classes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A369D] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Homework
          </Link>
        </div>

        {/* Header with Title & Graphic */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#0B1E48] tracking-tight">
              Assign New Homework Task
            </h1>
            <p className="font-sans text-sm text-[#5B6B87]">
              Publish problem sets, essay prompts, or laboratory reports directly to student and parent portals.
            </p>
          </div>

          {/* Right Top Graphic: Books + Notepad + Sticky Note */}
          <div className="flex items-center gap-4 shrink-0">
            {/* SVG Stack of Books and Notepad */}
            <div className="relative w-36 h-20">
              <svg viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
                {/* Book 1 (Navy Blue) */}
                <path d="M10 65 L80 65 L75 80 L5 80 Z" fill="#0A369D" />
                <path d="M80 65 L100 55 L95 70 L75 80 Z" fill="#062265" />
                <path d="M10 65 L30 55 L100 55 L80 65 Z" fill="#1D4ED8" />

                {/* Book 2 (Gold / Orange) */}
                <path d="M15 50 L85 50 L80 65 L10 65 Z" fill="#F59E0B" />
                <path d="M85 50 L105 40 L100 55 L80 65 Z" fill="#D97706" />
                <path d="M15 50 L35 40 L105 40 L85 50 Z" fill="#FBBF24" />

                {/* Book 3 (Emerald Green) */}
                <path d="M20 35 L90 35 L85 50 L15 50 Z" fill="#10B981" />
                <path d="M90 35 L110 25 L105 40 L85 50 Z" fill="#059669" />
                <path d="M20 35 L40 25 L110 25 L90 35 Z" fill="#34D399" />

                {/* Standing Paper / Notepad */}
                <rect x="75" y="15" width="48" height="60" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <line x1="83" y1="28" x2="115" y2="28" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="83" y1="36" x2="115" y2="36" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="83" y1="44" x2="115" y2="44" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="83" y1="52" x2="105" y2="52" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

                {/* Pencil leaning */}
                <line x1="120" y1="22" x2="98" y2="66" stroke="#EA580C" strokeWidth="4" strokeLinecap="round" />
                <polygon points="98,66 94,74 102,70" fill="#FBBF24" />
                <polygon points="94,74 93,76 96,75" fill="#1E293B" />
              </svg>
            </div>

            {/* Yellow Sticky Note with Pin */}
            <div className="relative bg-[#FFFBEB] border border-[#FDE68A] shadow-xs rounded-lg p-3 w-40 transform rotate-1 transition-transform hover:rotate-0 select-none">
              {/* Pushpin at top right */}
              <div className="absolute -top-2 right-2 w-3.5 h-3.5 rounded-full bg-[#EA580C] shadow-xs flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white"></div>
              </div>
              <p className="font-serif italic text-xs font-bold text-[#78350F] leading-tight text-center">
                Small Assignments Build Big Learners!
              </p>
            </div>
          </div>
        </div>

        {/* Pdf Preview Modal */}
        <PdfPreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title="Official Assignment Brief & Rubric"
          fileName="Assignment_Brief_Class12A_Math_PS4.pdf"
          content={previewContent}
          studentMeta={{
            name: "Class 12-A Scholars",
            rollNumber: "Subject Code: Mathematics (041)",
            form: "Class 12-A Senior Secondary",
            house: "Department of Mathematics",
            institutionName: "DELHI PUBLIC SCHOOL, R.K. PURAM",
            institutionAffiliation: "Affiliated to Central Board of Secondary Education (CBSE) • Affiliation No: 2730017",
            institutionAddress: "Sector XII, R.K. Puram, New Delhi - 110022 • School Code: 85214",
            academicSession: "2024–2025",
          }}
        />

        {/* Success Confirmation Card */}
        {isSuccess ? (
          <Card className="p-8 text-center space-y-6 border-[#0A369D]/30 bg-gradient-to-b from-white to-[#F0F7FF] rounded-2xl shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#EBFBF0] text-[#1D7C3F] border border-[#C3ECD0] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <Badge variant="gold">Dispatched to 38 Students</Badge>
              <h2 className="font-serif text-3xl font-bold text-[#0B1E48]">
                Homework Assignment Published
              </h2>
              <p className="font-sans text-sm text-[#5B6B87] max-w-md mx-auto">
                <strong className="text-[#0B1E48]">{formData.title}</strong> has been registered in the student timetable. Deadlines and rubric guidelines are now live on scholar and parent portals.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewOpen(true)}
                className="text-xs gap-1.5 border-gray-300 text-gray-700"
              >
                <FileText className="w-3.5 h-3.5 text-[#0A369D]" /> Preview Dispatched PDF
              </Button>
              <Link href="/teacher/homework/review">
                <Button className="bg-[#0A369D] hover:bg-[#082977] text-white text-xs gap-1.5 shadow-xs px-5">
                  <FileCheck2 className="w-4 h-4" />
                  Go to Homework Review Desk
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Form Sections */}
            <div className="lg:col-span-8 space-y-6">
              {/* Section 1: Assignment Details */}
              <Card className="p-6 bg-white border border-gray-200/90 rounded-2xl shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0A369D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      1
                    </div>
                    <h2 className="font-serif text-base font-bold text-[#0B1E48]">
                      Assignment Details
                    </h2>
                  </div>
                  <span className="text-[11px] text-[#718096] font-medium hidden sm:inline">
                    Provide the basic information about the homework
                  </span>
                </div>

                <div className="space-y-4 text-xs font-sans">
                  {/* Assignment Title */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#0B1E48]">
                      Assignment Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="bg-white border-gray-200 text-gray-800 text-xs h-10 rounded-lg focus:border-[#0A369D] focus:ring-[#0A369D]/20"
                    />
                  </div>

                  {/* 2-col Class & Subject */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-[#0B1E48]">
                        Target Class &amp; Section <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.className}
                          onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                          className="w-full h-10 px-3 pr-8 rounded-lg border border-gray-200 bg-white text-gray-800 text-xs appearance-none focus:outline-none focus:border-[#0A369D] focus:ring-1 focus:ring-[#0A369D]"
                        >
                          <option value="Class 12-A — Senior Secondary Mathematics">Class 12-A — Senior Secondary Mathematics</option>
                          <option value="Class 12-B — Applied Mathematics">Class 12-B — Applied Mathematics</option>
                          <option value="Class 11-A — Advanced Physics">Class 11-A — Advanced Physics</option>
                          <option value="Class 10-B — Foundation Mathematics">Class 10-B — Foundation Mathematics</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-[#0B1E48]">
                        Subject Area <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full h-10 px-3 pr-8 rounded-lg border border-gray-200 bg-white text-gray-800 text-xs appearance-none focus:outline-none focus:border-[#0A369D] focus:ring-1 focus:ring-[#0A369D]"
                        >
                          <option value="Mathematics (041)">Mathematics (041)</option>
                          <option value="Physics (042)">Physics (042)</option>
                          <option value="Applied Mathematics (241)">Applied Mathematics (241)</option>
                          <option value="Chemistry (043)">Chemistry (043)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* 2-col Due Date & Max Marks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-[#0B1E48]">
                        Due Date &amp; Cutoff Time <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                          <Input
                            type="text"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="bg-white border-gray-200 text-gray-800 text-xs h-10 pl-8 rounded-lg"
                            placeholder="YYYY-MM-DD"
                            required
                          />
                        </div>
                        <div className="relative">
                          <Clock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                          <Input
                            type="text"
                            value={formData.dueTime}
                            onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                            className="bg-white border-gray-200 text-gray-800 text-xs h-10 pl-8 rounded-lg"
                            placeholder="17:00 IST"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-[#0B1E48]">
                        Maximum Marks / Scale <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Scale className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                        <Input
                          type="number"
                          value={formData.maxMarks}
                          onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                          required
                          className="bg-white border-gray-200 text-gray-800 text-xs h-10 pl-8 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Section 2: Instructions & Problem Description */}
              <Card className="p-6 bg-white border border-gray-200/90 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0A369D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      2
                    </div>
                    <h2 className="font-serif text-base font-bold text-[#0B1E48]">
                      Instructions &amp; Problem Description
                    </h2>
                  </div>
                  <span className="text-[11px] text-[#718096] font-medium hidden sm:inline">
                    Clearly write what students need to do
                  </span>
                </div>

                {/* Rich text container with toolbar */}
                <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#0A369D] focus-within:ring-1 focus-within:ring-[#0A369D]">
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 text-gray-600">
                    <button
                      type="button"
                      className="p-1.5 hover:bg-white hover:text-gray-900 rounded transition-colors text-xs font-bold"
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 hover:bg-white hover:text-gray-900 rounded transition-colors text-xs italic"
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 hover:bg-white hover:text-gray-900 rounded transition-colors text-xs underline"
                      title="Underline"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <button
                      type="button"
                      className="p-1.5 hover:bg-white hover:text-gray-900 rounded transition-colors text-xs"
                      title="Ordered List"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 hover:bg-white hover:text-gray-900 rounded transition-colors text-xs"
                      title="Bulleted List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <button
                      type="button"
                      className="p-1.5 hover:bg-white hover:text-gray-900 rounded transition-colors text-xs"
                      title="Insert Link"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Textarea */}
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3.5 bg-white text-gray-800 text-xs leading-relaxed focus:outline-none resize-y"
                    required
                  />
                </div>
              </Card>

              {/* Section 3: Assessment Rubric & Grading Criteria */}
              <Card className="p-6 bg-white border border-gray-200/90 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0A369D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      3
                    </div>
                    <h2 className="font-serif text-base font-bold text-[#0B1E48]">
                      Assessment Rubric &amp; Grading Criteria
                    </h2>
                  </div>
                  <span className="text-[11px] text-[#718096] font-medium hidden sm:inline">
                    Define how the homework will be evaluated
                  </span>
                </div>

                {/* 3 Rubric Rows */}
                <div className="space-y-3">
                  {formData.rubrics.map((rubric) => {
                    const colorClasses =
                      rubric.color === "blue"
                        ? {
                            pillBg: "bg-blue-100 text-blue-700",
                            badgeBg: "bg-[#E8F1FF] text-[#0A369D] border border-blue-200",
                          }
                        : rubric.color === "emerald"
                        ? {
                            pillBg: "bg-emerald-100 text-emerald-700",
                            badgeBg: "bg-[#EBFBF0] text-[#1D7C3F] border border-emerald-200",
                          }
                        : {
                            pillBg: "bg-purple-100 text-purple-700",
                            badgeBg: "bg-[#F6EEFF] text-[#6E2BB1] border border-purple-200",
                          };

                    return (
                      <div
                        key={rubric.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-100 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${colorClasses.pillBg}`}
                          >
                            {rubric.id}
                          </div>
                          <span className="font-semibold text-gray-800">{rubric.label}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-md font-semibold text-xs ${colorClasses.badgeBg}`}>
                          {rubric.marks} marks
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Link href="/teacher/classes">
                  <Button
                    variant="outline"
                    type="button"
                    className="border-gray-200 text-gray-700 hover:bg-gray-50 text-xs px-5 rounded-lg h-10"
                  >
                    Cancel
                  </Button>
                </Link>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="border-gray-200 text-gray-700 hover:bg-gray-50 text-xs gap-1.5 h-10 rounded-lg"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#0A369D]" /> Preview PDF Brief
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#0A369D] hover:bg-[#082977] text-white text-xs font-semibold px-6 h-10 rounded-lg shadow-sm gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? "Publishing Task..." : "Publish to Scholar Portals"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Tips & Motivational Target Cards */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card 1: Tips for a Good Assignment */}
              <Card className="p-6 bg-white border border-gray-200/90 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#0B1E48]">
                      Tips for a
                    </h3>
                    <h4 className="font-serif text-base font-bold text-[#0B1E48]">
                      Good Assignment
                    </h4>
                  </div>
                </div>

                <div className="space-y-3.5 pt-2 text-xs text-gray-700">
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                    </div>
                    <span className="font-medium">Give clear instructions</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                    </div>
                    <span className="font-medium">Set a realistic deadline</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                    </div>
                    <span className="font-medium">Add marking scheme</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                    </div>
                    <span className="font-medium">Keep it aligned with syllabus</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                    </div>
                    <span className="font-medium">Students and parents will get notified automatically</span>
                  </div>
                </div>
              </Card>

              {/* Card 2: Motivational Target Card */}
              <div className="bg-[#FFF0F4] border border-[#FFE2E7] rounded-2xl p-6 text-center shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-full bg-white text-[#E53E5E] border border-[#FFCDD2] flex items-center justify-center mx-auto shadow-2xs">
                  <Target className="w-5 h-5" />
                </div>
                <p className="font-serif italic font-semibold text-sm text-[#0B1E48] leading-relaxed">
                  &ldquo;You&apos;re creating opportunities for brighter futures!&rdquo;
                </p>
                <div className="w-10 h-1 bg-[#EA580C] rounded-full mx-auto" />
              </div>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}

