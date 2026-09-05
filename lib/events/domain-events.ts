/**
 * AGRAGATI PLATFORM — Typed Domain Event Bus
 *
 * Centralized, reactive domain event bus connecting all 8 portals.
 * Decouples mutations from side-effects (audit logging, notifications, telemetry recalculation).
 */

import { logAudit, AuditAction } from "@/lib/services/audit-service";

export type DomainEventType =
  | "student.created"
  | "student.enrolled"
  | "student.transferred"
  | "student.promoted"
  | "student.archived"
  | "admission.submitted"
  | "admission.approved"
  | "admission.rejected"
  | "attendance.marked"
  | "attendance.corrected"
  | "homework.created"
  | "homework.submitted"
  | "assignment.graded"
  | "marks.entered"
  | "marks.published"
  | "invoice.created"
  | "payment.completed"
  | "expense.created"
  | "expense.approved"
  | "expense.paid"
  | "leave.requested"
  | "leave.approved"
  | "leave.rejected"
  | "discipline.logged"
  | "discipline.resolved"
  | "announcement.published";

export interface DomainEvent<T = any> {
  id: string;
  type: DomainEventType;
  schoolId: string;
  organizationId?: string;
  actorId: string;
  timestamp: string;
  payload: T;
}

export type DomainEventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

class DomainEventBus {
  private handlers = new Map<string, Set<DomainEventHandler>>();

  /**
   * Register a subscriber for a domain event.
   */
  public subscribe<T = any>(eventType: DomainEventType | "*", handler: DomainEventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Unsubscribe handle
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Publish a domain event across the system.
   */
  public async emit<T = any>(
    type: DomainEventType,
    schoolId: string,
    actorId: string,
    payload: T,
    organizationId?: string
  ): Promise<DomainEvent<T>> {
    const event: DomainEvent<T> = {
      id: "evt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      type,
      schoolId,
      organizationId,
      actorId,
      timestamp: new Date().toISOString(),
      payload,
    };

    // 1. Automatically write audit trail
    try {
      await logAudit({
        schoolId,
        actorId,
        action: type.toUpperCase().replace(/\./g, "_") as any,
        entityTable: type.split(".")[0],
        entityId: (payload as any)?.id || (payload as any)?.studentId || (payload as any)?.invoiceId || schoolId,
        newValues: typeof payload === "object" ? (payload as any) : { value: payload },
      });
    } catch (auditErr) {
      console.warn("Domain event audit logging fallback:", auditErr);
    }

    // 2. Dispatch to specific listeners
    const specificHandlers = this.handlers.get(type);
    if (specificHandlers) {
      for (const handler of specificHandlers) {
        try {
          await handler(event);
        } catch (handlerErr) {
          console.error(`Error in domain event handler for ${type}:`, handlerErr);
        }
      }
    }

    // 3. Dispatch to wildcard listeners
    const wildcardHandlers = this.handlers.get("*");
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        try {
          await handler(event);
        } catch (wildcardErr) {
          console.error(`Error in wildcard domain event handler for ${type}:`, wildcardErr);
        }
      }
    }

    return event;
  }
}

export const domainEventBus = new DomainEventBus();

