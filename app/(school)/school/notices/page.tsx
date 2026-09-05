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
      userName="Mme. Claire De La Tour"
      userRoleTitle="Head of School & Proviseur"
      epochText="Term 3 Cycle (Michaelmas) • Geneva Campus"
    >
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="gold" dot>
                Campus Bulletin Desk
              </Badge>
              <span className="font-sans text-xs text-on-surface-variant">
                Official Institutional Communications Channel
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-primary">
              Notices &amp; Official Bulletins
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1 max-w-2xl">
              Publish proviseur announcements, emergency safety broadcasts, examination guidelines, and departmental bulletins.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="font-sans gap-2"
            >
              <PlusCircle className="w-4 h-4 text-secondary-container" />
              Draft Official Bulletin
            </Button>
          </div>
        </div>

        {/* Audience Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-px overflow-x-auto font-sans text-xs">
          {[
            { id: "ALL", label: "All Communications" },
            { id: "ALL_CAMPUS", label: "All Campus" },
            { id: "SENIOR_WING", label: "Senior Wing" },
            { id: "FACULTY_ONLY", label: "Faculty Only" },
            { id: "PARENTS_ONLY", label: "Parents & Governors" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAudienceFilter(tab.id)}
              className={`px-4 py-2.5 rounded-t-lg font-medium transition-all whitespace-nowrap ${
                audienceFilter === tab.id
                  ? "bg-surface text-primary border-t-2 border-secondary shadow-sm font-semibold"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-variant/30"
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
                  ? "border-secondary/60 bg-gradient-to-r from-surface via-secondary-container/5 to-surface shadow-sm"
                  : "border-border/80 bg-surface"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {not.isPinned && (
                      <span className="flex items-center gap-1 font-sans text-xs font-bold text-secondary">
                        <Pin className="w-3.5 h-3.5 fill-secondary" /> Pinned
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
                  Issued by: <strong className="text-primary">{not.authorName}</strong> ({not.authorTitle})
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
            title="Draft Official Institutional Bulletin"
            maxWidth="lg"
          >
            <div className="space-y-4 font-sans text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-primary">Bulletin Title *</label>
                <Input
                  placeholder="e.g. Lent Term Academic Calendar Update &amp; Hall Schedules"
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
                    className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-secondary"
                  >
                    <option value="ALL_CAMPUS">All Campus Community</option>
                    <option value="SENIOR_WING">Senior Wing Scholars (Forms V &amp; VI)</option>
                    <option value="FACULTY_ONLY">Faculty &amp; Senior Masters Only</option>
                    <option value="PARENTS_ONLY">Parents &amp; Governors</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-primary">Priority Level *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-secondary"
                  >
                    <option value="ACADEMIC">Academic / Curricular</option>
                    <option value="URGENT">Urgent / Safety Broadcast</option>
                    <option value="GENERAL">General Notice</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-primary">Bulletin Content *</label>
                <textarea
                  rows={5}
                  placeholder="Enter the official communique details, schedules, requirements, or procedural instructions..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3 rounded-lg border border-border bg-surface text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-secondary"
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
                  className="gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-secondary-container" />
                  {isSubmitting ? "Publishing..." : "Publish Official Bulletin"}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
