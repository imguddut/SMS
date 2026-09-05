/**
 * AGRAGATI SCHOOL OS — Realtime Cross-Portal Sync Provider
 *
 * Subscribes to Supabase Realtime channels for the user's school_id.
 * Listens to postgres_changes on key tables and provides a hook for
 * portal pages to react to mutations from other portals.
 */
"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./auth-context";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RealtimeTable =
  | "attendance_records"
  | "attendance_entries"
  | "homework_assignments"
  | "homework_submissions"
  | "invoices"
  | "payments"
  | "notices"
  | "approvals"
  | "marks_entries"
  | "students"
  | "enrollments";

export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

export interface RealtimeEvent {
  table: RealtimeTable;
  eventType: RealtimeEventType;
  new: Record<string, unknown>;
  old: Record<string, unknown>;
  timestamp: string;
}

type RealtimeListener = (event: RealtimeEvent) => void;

interface RealtimeContextValue {
  /** Subscribe to events on a specific table */
  subscribe: (table: RealtimeTable, eventType: RealtimeEventType, listener: RealtimeListener) => () => void;
  /** Whether the realtime connection is active */
  isConnected: boolean;
  /** Number of active listeners */
  listenerCount: number;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const RealtimeContext = React.createContext<RealtimeContextValue>({
  subscribe: () => () => {},
  isConnected: false,
  listenerCount: 0,
});

// ---------------------------------------------------------------------------
// Tables to subscribe to
// ---------------------------------------------------------------------------

const WATCHED_TABLES: RealtimeTable[] = [
  "attendance_records",
  "attendance_entries",
  "homework_assignments",
  "homework_submissions",
  "invoices",
  "payments",
  "notices",
  "approvals",
  "marks_entries",
  "students",
  "enrollments",
];

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { schoolId, isAuthenticated } = useAuth();
  const listenersRef = React.useRef<Map<string, Set<RealtimeListener>>>(new Map());
  const channelRef = React.useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [listenerCount, setListenerCount] = React.useState(0);

  // Set up realtime channel when authenticated
  React.useEffect(() => {
    if (!isAuthenticated || !schoolId) return;

    try {
      const supabase = createClient();
      const channelName = `school-${schoolId}`;

      // Create channel with postgres_changes for each watched table
      let channel = supabase.channel(channelName);

      for (const table of WATCHED_TABLES) {
        channel = channel.on(
          "postgres_changes" as any,
          {
            event: "*",
            schema: "public",
            table,
            filter: table === "attendance_entries" || table === "homework_submissions" || table === "marks_entries"
              ? undefined // Junction tables don't have school_id
              : `school_id=eq.${schoolId}`,
          },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            const event: RealtimeEvent = {
              table,
              eventType: payload.eventType as RealtimeEventType,
              new: (payload.new as Record<string, unknown>) || {},
              old: (payload.old as Record<string, unknown>) || {},
              timestamp: new Date().toISOString(),
            };

            // Dispatch to all matching listeners
            const key = `${table}:${payload.eventType}`;
            const allKey = `${table}:*`;

            const specificListeners = listenersRef.current.get(key);
            const allListeners = listenersRef.current.get(allKey);

            specificListeners?.forEach((listener) => {
              try {
                listener(event);
              } catch (err) {
                console.error(`Realtime listener error for ${key}:`, err);
              }
            });

            allListeners?.forEach((listener) => {
              try {
                listener(event);
              } catch (err) {
                console.error(`Realtime listener error for ${allKey}:`, err);
              }
            });
          }
        );
      }

      channel.subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

      channelRef.current = channel;

      return () => {
        supabase.removeChannel(channel);
        channelRef.current = null;
        setIsConnected(false);
      };
    } catch (err) {
      console.warn("RealtimeProvider: Error setting up channel:", err);
    }
  }, [schoolId, isAuthenticated]);

  const subscribe = React.useCallback(
    (table: RealtimeTable, eventType: RealtimeEventType | "*", listener: RealtimeListener): (() => void) => {
      const key = `${table}:${eventType}`;

      if (!listenersRef.current.has(key)) {
        listenersRef.current.set(key, new Set());
      }
      listenersRef.current.get(key)!.add(listener);
      setListenerCount((c) => c + 1);

      // Return unsubscribe function
      return () => {
        listenersRef.current.get(key)?.delete(listener);
        setListenerCount((c) => Math.max(0, c - 1));
      };
    },
    []
  );

  const value = React.useMemo(
    () => ({ subscribe, isConnected, listenerCount }),
    [subscribe, isConnected, listenerCount]
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Subscribe to realtime events on a specific table.
 *
 * @example
 * ```tsx
 * useRealtimeEvent("attendance_entries", "INSERT", (event) => {
 *   console.log("New attendance entry:", event.new);
 *   refetch(); // Re-fetch data
 * });
 * ```
 */
export function useRealtimeEvent(
  table: RealtimeTable,
  eventType: RealtimeEventType | "*",
  callback: RealtimeListener
) {
  const { subscribe } = React.useContext(RealtimeContext);
  const callbackRef = React.useRef(callback);
  callbackRef.current = callback;

  React.useEffect(() => {
    const unsubscribe = subscribe(table, eventType as RealtimeEventType, (event) => {
      callbackRef.current(event);
    });
    return unsubscribe;
  }, [table, eventType, subscribe]);
}

/**
 * Get realtime connection status.
 */
export function useRealtimeStatus() {
  const { isConnected, listenerCount } = React.useContext(RealtimeContext);
  return { isConnected, listenerCount };
}
