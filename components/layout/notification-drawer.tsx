"use client";

import * as React from "react";
import Link from "next/link";
import { UserRole } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  NotificationItem,
} from "@/lib/db/notifications";
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  GraduationCap,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";

export interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  role,
  onUnreadCountChange,
}: NotificationDrawerProps) {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [filter, setFilter] = React.useState<"ALL" | "UNREAD" | "URGENT">("ALL");
  const [isLoading, setIsLoading] = React.useState(true);

  const loadNotifications = React.useCallback(async () => {
    try {
      const data = await fetchUserNotifications(role);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      if (onUnreadCountChange) {
        onUnreadCountChange(data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setIsLoading(false);
    }
  }, [role, onUnreadCountChange]);

  React.useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    const newCount = Math.max(0, unreadCount - 1);
    setUnreadCount(newCount);
    if (onUnreadCountChange) onUnreadCountChange(newCount);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(role);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    if (onUnreadCountChange) onUnreadCountChange(0);
  };

  if (!isOpen) return null;

  const filteredItems = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    if (filter === "URGENT") return n.priority === "URGENT" || n.priority === "HIGH";
    return true;
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Flyout Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-surface z-50 shadow-2xl border-l border-surface-container-high flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Top Drawer Header */}
        <div className="p-5 border-b border-surface-container-high flex items-center justify-between bg-surface-container-lowest/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-medium text-primary">
                  Notification Center
                </h3>
                {unreadCount > 0 && (
                  <Badge variant="gold" className="text-[10px]">
                    {unreadCount} Unread
                  </Badge>
                )}
              </div>
              <span className="font-sans text-[11px] text-on-surface-variant">
                Role Context: <strong className="text-primary">{role.replace("_", " ")}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="px-5 py-2.5 bg-surface-container-lowest border-b border-surface-container-high flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-1">
            {[
              { id: "ALL", label: "All" },
              { id: "UNREAD", label: `Unread (${unreadCount})` },
              { id: "URGENT", label: "Urgent" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filter === f.id
                    ? "bg-primary text-surface font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-secondary hover:underline text-[11px] font-semibold"
            >
              Mark All Read
            </button>
          )}
        </div>

        {/* Notification Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-surface-container-high/40">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#3D5B42]/50 mx-auto" />
              <p className="font-serif text-base text-primary">All Caught Up</p>
              <p className="font-sans text-xs text-on-surface-variant">
                No active notifications in this category.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`pt-3 first:pt-0 p-3 rounded-lg transition-colors ${
                  item.isRead
                    ? "bg-surface-container-lowest/40"
                    : "bg-surface-container-lowest border-l-4 border-l-secondary shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        item.category === "TREASURY"
                          ? "gold"
                          : item.category === "SECURITY"
                          ? "critical"
                          : item.category === "ACADEMIC"
                          ? "navy"
                          : "neutral"
                      }
                      className="text-[9px]"
                    >
                      {item.category}
                    </Badge>
                    {item.priority === "URGENT" && (
                      <Badge variant="critical" className="text-[9px]">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <span className="font-sans text-[10px] text-on-surface-variant">
                    {item.timestamp}
                  </span>
                </div>

                <h4 className="font-serif text-sm font-medium text-primary leading-snug">
                  {item.title}
                </h4>

                <p className="font-sans text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {item.message}
                </p>

                <div className="mt-3 pt-2 border-t border-surface-container-high/60 flex items-center justify-between">
                  {!item.isRead ? (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="text-[11px] text-on-surface-variant hover:text-primary flex items-center gap-1 font-medium"
                    >
                      <Check className="w-3 h-3 text-[#3D5B42]" /> Mark read
                    </button>
                  ) : (
                    <span className="text-[10px] text-on-surface-variant">Read</span>
                  )}

                  {item.linkUrl && (
                    <Link
                      href={item.linkUrl}
                      onClick={() => {
                        handleMarkAsRead(item.id);
                        onClose();
                      }}
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-[11px] h-7 px-2.5 gap-1"
                      >
                        {item.actionText || "Inspect"}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Drawer Footer */}
        <div className="p-3 border-t border-surface-container-high bg-surface-container-lowest/80 text-center">
          <span className="font-sans text-[11px] text-on-surface-variant">
            Encrypted Sovereign Alert Enclave • ISO 20022 Webhooks Synced
          </span>
        </div>
      </div>
    </>
  );
}
