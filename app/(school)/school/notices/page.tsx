"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Bell,
  PlusCircle,
  Pin,
  Calendar,
  Send,
  Users,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import {
  fetchNoticesBulletins,
  createNotice,
  CampusNoticeItem,
} from "@/lib/db/school-admin";

export default function SchoolNoticesPage() {
  const [notices, setNotices] = React.useState<CampusNoticeItem[]>([]);
  const [audienceFilter, setAudienceFilter] = React.useState("ALL");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: "",
    content: "",
    audience: "ALL_CAMPUS" as any,
    priority: "ACADEMIC" as any,
  });

  React.useEffect(() => {
    async function load() {
      const data = await fetchNoticesBulletins();
      setNotices(data);
    }
    load();
  }, []);

  const handleCreateNotice = async () => {
    if (!formData.title || !formData.content) return;
    setIsSubmitting(true);
    try {
      const newNotice = await createNotice(formData);
      setNotices([newNotice, ...notices]);
      setIsModalOpen(false);
      setFormData({
        title: "",
        content: "",
        audience: "ALL_CAMPUS",
        priority: "ACADEMIC",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredNotices = notices.filter(
    (n) => audienceFilter === "ALL" || n.audience === audienceFilter
  );

  return (
    <AppShell
      role="PRINCIPAL"
      userName="Dr. Arvind Swaminathan"
      userRoleTitle="Principal & Head of School"
      epochText="Academic Year 2024–2025 • Term 2 (CBSE)"
    >
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" dot>
                School Notices
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                Announcements &amp; Circulars
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              School Notices &amp; Circulars
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Post important updates, exam timetables, holiday announcements, and event circulars.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="font-sans gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusCircle className="w-4 h-4" />
              + Post New Notice
            </Button>
          </div>
        </div>

        {/* Audience Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-px overflow-x-auto font-sans text-xs">
          {[
            { id: "ALL", label: "All Notices" },
            { id: "ALL_CAMPUS", label: "Whole School" },
            { id: "SENIOR_WING", label: "Senior Classes (11 & 12)" },
            { id: "FACULTY_ONLY", label: "Teachers & Staff" },
            { id: "PARENTS_ONLY", label: "Parents Only" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAudienceFilter(tab.id)}
              className={`px-4 py-2.5 rounded-t-lg font-medium transition-all whitespace-nowrap ${
                audienceFilter === tab.id
                  ? "bg-surface text-blue-600 border-t-2 border-blue-600 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bulletins Stream */}
        <div className="space-y-4">
          {filteredNotices.map((not) => (
            <Card
              key={not.id}
              className={`p-6 border transition-all ${
                not.isPinned
                  ? "border-blue-300 bg-blue-50/20 shadow-sm"
                  : "border-border/80 bg-surface"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {not.isPinned && (
                      <span className="flex items-center gap-1 font-sans text-xs font-bold text-blue-600">
                        <Pin className="w-3.5 h-3.5 fill-blue-600" /> Pinned
                      </span>
                    )}
                    <h3 className="font-serif text-xl font-medium text-primary">
                      {not.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="navy">
                    {not.audience.replace(/_/g, " ")}
                  </Badge>
                  <Badge
                    variant={
                      not.priority === "URGENT"
                        ? "critical"
                        : not.priority === "ACADEMIC"
                        ? "gold"
                        : "neutral"
                    }
                  >
                    {not.priority}
                  </Badge>
                </div>
              </div>

              <p className="font-sans text-sm text-on-surface leading-relaxed whitespace-pre-line">
                {not.content}
              </p>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between font-sans text-xs text-on-surface-variant">
                <span>
                  Posted by: <strong className="text-primary">{not.authorName}</strong> ({not.authorTitle})
                </span>
                <span className="font-mono">{not.publishedAt}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Draft Notice Modal */}
        {isModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsModalOpen(false)}
            title="Create New School Notice"
            maxWidth="lg"
          >
            <div className="space-y-4 font-sans text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-primary">Notice Title *</label>
                <Input
                  placeholder="e.g. Mid-Term Examination Datesheet & Guidelines"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-primary">Target Audience *</label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ALL_CAMPUS">Whole School</option>
                    <option value="SENIOR_WING">Senior Classes (11 &amp; 12)</option>
                    <option value="FACULTY_ONLY">Teachers &amp; Staff Only</option>
                    <option value="PARENTS_ONLY">Parents Only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-primary">Priority Level *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ACADEMIC">Academic / Exams</option>
                    <option value="URGENT">Urgent Notice</option>
                    <option value="GENERAL">General Announcement</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-primary">Notice Content *</label>
                <textarea
                  rows={5}
                  placeholder="Type the announcement details, dates, or instructions here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3 rounded-lg border border-border bg-surface text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting || !formData.title || !formData.content}
                  onClick={handleCreateNotice}
                  className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Publishing..." : "Publish Notice"}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
