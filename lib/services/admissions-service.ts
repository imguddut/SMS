/**
 * AGRAGATI SCHOOL OS — Admissions Domain Service
 *
 * Manages the student admission lifecycle:
 * - Application intake
 * - Document verification & review
 * - Interview scheduling & entrance scores
 * - Final approval or rejection
 * - One-click conversion to enrolled Scholar record
 *
 * Persists to Supabase `admissions` table with seamless fallback to `sharedStore`.
 */

import { createClient } from "@/lib/supabase/client";
import { sharedStore, SharedAdmission } from "@/lib/db/shared-store";
import { domainEventBus } from "@/lib/events/domain-events";
import { logAudit } from "./audit-service";

export type AdmissionStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "INTERVIEW_SCHEDULED"
  | "APPROVED"
  | "REJECTED"
  | "ENROLLED";

export interface CreateAdmissionInput {
  schoolId: string;
  applicantName: string;
  dateOfBirth: string;
  gender: string;
  gradeApplyingFor: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  notes?: string;
  entranceScore?: number;
}

export async function getAdmissions(
  schoolId: string = "11111111-1111-1111-1111-111111111111",
  statusFilter?: AdmissionStatus
): Promise<SharedAdmission[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from("admissions")
      .select("*")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        schoolId: d.school_id,
        applicationNo: d.application_no,
        applicantName: d.applicant_name,
        dateOfBirth: d.date_of_birth,
        gender: d.gender,
        gradeApplyingFor: d.grade_applying_for,
        parentName: d.parent_name,
        parentEmail: d.parent_email,
        parentPhone: d.parent_phone,
        address: d.address,
        status: d.status as AdmissionStatus,
        entranceScore: d.entrance_score,
        notes: d.notes,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
    }
  } catch (err) {
    // Fallback to shared reactive store
  }

  let list = sharedStore.getAdmissions(schoolId);
  if (statusFilter) {
    list = list.filter((a) => a.status === statusFilter);
  }
  return list;
}

export async function getAdmissionById(id: string): Promise<SharedAdmission | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("admissions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (data) {
      return {
        id: data.id,
        schoolId: data.school_id,
        applicationNo: data.application_no,
        applicantName: data.applicant_name,
        dateOfBirth: data.date_of_birth,
        gender: data.gender,
        gradeApplyingFor: data.grade_applying_for,
        parentName: data.parent_name,
        parentEmail: data.parent_email,
        parentPhone: data.parent_phone,
        address: data.address,
        status: data.status as AdmissionStatus,
        entranceScore: data.entrance_score,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  } catch (err) {
    // Fallback
  }

  return sharedStore.getAdmissionById(id) || null;
}

export async function createAdmission(
  input: CreateAdmissionInput,
  actorId: string = "b0000000-0000-0000-0000-000000000003"
): Promise<SharedAdmission> {
  const applicationNo = `ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("admissions")
      .insert({
        school_id: input.schoolId,
        application_no: applicationNo,
        applicant_name: input.applicantName,
        date_of_birth: input.dateOfBirth,
        gender: input.gender,
        grade_applying_for: input.gradeApplyingFor,
        parent_name: input.parentName,
        parent_email: input.parentEmail,
        parent_phone: input.parentPhone,
        address: input.address,
        notes: input.notes,
        entrance_score: input.entranceScore,
        status: "PENDING",
      })
      .select()
      .single();

    if (!error && data) {
      const record: SharedAdmission = {
        id: data.id,
        schoolId: data.school_id,
        applicationNo: data.application_no,
        applicantName: data.applicant_name,
        dateOfBirth: data.date_of_birth,
        gender: data.gender,
        gradeApplyingFor: data.grade_applying_for,
        parentName: data.parent_name,
        parentEmail: data.parent_email,
        parentPhone: data.parent_phone,
        address: data.address,
        status: data.status as AdmissionStatus,
        entranceScore: data.entrance_score,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      // Emit domain event
      await domainEventBus.emit("admission.submitted", input.schoolId, actorId, record);
      return record;
    }
  } catch (err) {
    // Fallback to shared reactive store
  }

  const created = sharedStore.createAdmission({
    schoolId: input.schoolId,
    applicationNo,
    applicantName: input.applicantName,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
    gradeApplyingFor: input.gradeApplyingFor,
    parentName: input.parentName,
    parentEmail: input.parentEmail,
    parentPhone: input.parentPhone,
    address: input.address,
    notes: input.notes,
    entranceScore: input.entranceScore,
    status: "PENDING",
  });

  await domainEventBus.emit("admission.submitted", input.schoolId, actorId, created);
  return created;
}

export async function updateAdmissionStatus(
  id: string,
  status: AdmissionStatus,
  notes?: string,
  actorId: string = "b0000000-0000-0000-0000-000000000003"
): Promise<SharedAdmission | null> {
  let updated: SharedAdmission | null = null;

  try {
    const supabase = createClient();
    const updatePayload: any = { status, updated_at: new Date().toISOString() };
    if (notes !== undefined) updatePayload.notes = notes;

    const { data, error } = await supabase
      .from("admissions")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      updated = {
        id: data.id,
        schoolId: data.school_id,
        applicationNo: data.application_no,
        applicantName: data.applicant_name,
        dateOfBirth: data.date_of_birth,
        gender: data.gender,
        gradeApplyingFor: data.grade_applying_for,
        parentName: data.parent_name,
        parentEmail: data.parent_email,
        parentPhone: data.parent_phone,
        address: data.address,
        status: data.status as AdmissionStatus,
        entranceScore: data.entrance_score,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  } catch (err) {
    // Fallback
  }

  if (!updated) {
    updated = sharedStore.updateAdmissionStatus(id, status, notes);
  }

  if (updated) {
    if (status === "APPROVED") {
      await domainEventBus.emit("admission.approved", updated.schoolId, actorId, updated);
    } else if (status === "REJECTED") {
      await domainEventBus.emit("admission.rejected", updated.schoolId, actorId, updated);
    } else {
      await logAudit({
        schoolId: updated.schoolId,
        actorId,
        action: "UPDATE",
        entityTable: "admissions",
        entityId: updated.id,
        newValues: { status, notes },
      });
    }
  }

  return updated;
}

export async function enrollApplicant(
  id: string,
  actorId: string = "b0000000-0000-0000-0000-000000000003"
): Promise<{ admission: SharedAdmission; studentId: string } | null> {
  const res = sharedStore.enrollAdmissionStudent(id);
  if (!res) return null;

  try {
    const supabase = createClient();
    await supabase
      .from("admissions")
      .update({ status: "ENROLLED", updated_at: new Date().toISOString() })
      .eq("id", id);
  } catch (err) {
    // Fallback
  }

  await domainEventBus.emit("student.enrolled", res.admission.schoolId, actorId, {
    admissionId: id,
    studentId: res.studentId,
    studentName: res.admission.applicantName,
    grade: res.admission.gradeApplyingFor,
  });

  return res;
}

export async function getAdmissionStats(schoolId: string = "11111111-1111-1111-1111-111111111111") {
  const admissions = await getAdmissions(schoolId);
  return {
    total: admissions.length,
    pending: admissions.filter((a) => a.status === "PENDING").length,
    underReview: admissions.filter((a) => a.status === "UNDER_REVIEW").length,
    interviewScheduled: admissions.filter((a) => a.status === "INTERVIEW_SCHEDULED").length,
    approved: admissions.filter((a) => a.status === "APPROVED").length,
    enrolled: admissions.filter((a) => a.status === "ENROLLED").length,
    rejected: admissions.filter((a) => a.status === "REJECTED").length,
  };
}
