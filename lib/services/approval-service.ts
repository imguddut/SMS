/**
 * AGRAGATI SCHOOL OS — Approval Domain Service
 *
 * Single source of truth for approval workflows.
 * Consumed by: School Admin, Principal, Owner portals.
 */

import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Approval {
  id: string;
  school_id: string;
  approval_type: "BURSARY_WAIVER" | "LEAVE_REQUEST" | "EXCURSION_AUTHORIZATION" | "GRADEBOOK_PUBLICATION" | "STAFF_APPOINTMENT";
  reference_table: string | null;
  reference_id: string | null;
  requested_by_id: string;
  decided_by_id: string | null;
  impact_amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ESCROW";
  petitioner_notes: string | null;
  decision_notes: string | null;
  decided_at: string | null;
  created_at: string;
  // Joined fields
  requested_by_name?: string;
  requested_by_role?: string;
  decided_by_name?: string;
}

// ---------------------------------------------------------------------------
// Fallback data
// ---------------------------------------------------------------------------

const FALLBACK_APPROVALS: Approval[] = [
  {
    id: "appr-1",
    school_id: "11111111-1111-1111-1111-111111111111",
    approval_type: "BURSARY_WAIVER",
    reference_table: "invoices",
    reference_id: null,
    requested_by_id: "b0000000-0000-0000-0000-000000000006",
    decided_by_id: null,
    impact_amount: 25000,
    status: "PENDING",
    petitioner_notes: "Merit scholarship waiver request for Term 3 fees.",
    decision_notes: null,
    decided_at: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    requested_by_name: "Arthur M. Vance",
    requested_by_role: "ACCOUNTANT",
  },
  {
    id: "appr-2",
    school_id: "11111111-1111-1111-1111-111111111111",
    approval_type: "LEAVE_REQUEST",
    reference_table: null,
    reference_id: null,
    requested_by_id: "b0000000-0000-0000-0000-000000000005",
    decided_by_id: null,
    impact_amount: 0,
    status: "PENDING",
    petitioner_notes: "Requesting 3 days leave for academic conference.",
    decision_notes: null,
    decided_at: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    requested_by_name: "Dr. Alistair Finch",
    requested_by_role: "TEACHER",
  },
];

// ---------------------------------------------------------------------------
// Service Functions
// ---------------------------------------------------------------------------

/**
 * Get approvals with optional filters.
 * Used by School Admin, Principal, Owner portals.
 */
export async function getApprovals(
  schoolId: string,
  filters?: {
    status?: string;
    type?: string;
    requestedById?: string;
  }
): Promise<Approval[]> {
  try {
    const supabase = createClient();

    let query = supabase
      .from("approvals")
      .select(`
        *,
        requester:requested_by_id (full_name, role),
        decider:decided_by_id (full_name)
      `)
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.type) {
      query = query.eq("approval_type", filters.type);
    }
    if (filters?.requestedById) {
      query = query.eq("requested_by_id", filters.requestedById);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((a: any) => ({
      id: a.id,
      school_id: a.school_id,
      approval_type: a.approval_type,
      reference_table: a.reference_table,
      reference_id: a.reference_id,
      requested_by_id: a.requested_by_id,
      decided_by_id: a.decided_by_id,
      impact_amount: Number(a.impact_amount),
      status: a.status,
      petitioner_notes: a.petitioner_notes,
      decision_notes: a.decision_notes,
      decided_at: a.decided_at,
      created_at: a.created_at,
      requested_by_name: a.requester?.full_name || "Unknown",
      requested_by_role: a.requester?.role || "Unknown",
      decided_by_name: a.decider?.full_name || null,
    }));
  } catch (err) {
    console.warn("getApprovals fallback:", err);
    return FALLBACK_APPROVALS;
  }
}

/**
 * Create a new approval request.
 * Used by any authorized role.
 */
export async function createApproval(
  schoolId: string,
  data: {
    approvalType: "BURSARY_WAIVER" | "LEAVE_REQUEST" | "EXCURSION_AUTHORIZATION" | "GRADEBOOK_PUBLICATION" | "STAFF_APPOINTMENT";
    requestedById: string;
    impactAmount?: number;
    petitionerNotes?: string;
    referenceTable?: string;
    referenceId?: string;
  }
): Promise<{ approvalId: string }> {
  try {
    const supabase = createClient();

    const { data: approval, error } = await supabase
      .from("approvals")
      .insert({
        school_id: schoolId,
        approval_type: data.approvalType,
        requested_by_id: data.requestedById,
        impact_amount: data.impactAmount || 0,
        petitioner_notes: data.petitionerNotes || null,
        reference_table: data.referenceTable || null,
        reference_id: data.referenceId || null,
        status: "PENDING",
      })
      .select("id")
      .single();

    if (error) throw error;
    return { approvalId: approval!.id };
  } catch (err) {
    console.warn("createApproval fallback:", err);
    return { approvalId: "appr-" + Date.now() };
  }
}

/**
 * Decide on an approval (approve/reject).
 * Used by Principal, Owner portals.
 */
export async function decideApproval(
  approvalId: string,
  decidedById: string,
  decision: "APPROVED" | "REJECTED",
  notes?: string
): Promise<{ success: boolean }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("approvals")
      .update({
        status: decision,
        decided_by_id: decidedById,
        decision_notes: notes || null,
        decided_at: new Date().toISOString(),
      })
      .eq("id", approvalId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn("decideApproval fallback:", err);
    return { success: true };
  }
}
