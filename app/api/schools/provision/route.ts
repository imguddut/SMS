/**
 * POST /api/schools/provision
 *
 * Server-side school provisioning that bypasses RLS using the service_role key.
 * This is the authoritative write path for creating new school tenants.
 *
 * Required body: ProvisionSchoolPayload + orgId + actorId
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase credentials not configured on server.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, actorId, payload } = body as {
      orgId: string;
      actorId: string;
      payload: Record<string, any>;
    };

    if (!orgId || !payload?.name || !payload?.slug) {
      return NextResponse.json(
        { error: "orgId, payload.name, and payload.slug are required." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // ─── Step 1: Insert school row ────────────────────────────────────────────
    const schoolCode =
      payload.schoolCode ||
      `SCH-${Math.floor(100 + Math.random() * 900)}`;

    const { data: schoolRow, error: schoolErr } = await supabase
      .from("schools")
      .insert({
        organization_id: orgId,
        legal_name: payload.legalName || payload.name,
        slug: payload.slug,
        domain: `${payload.slug}.agragati.edu`,
        school_code: schoolCode,
        status: "PROVISIONING",
        base_currency: payload.currency || "INR",
      })
      .select("id, legal_name, slug, school_code, status, base_currency, created_at")
      .single();

    if (schoolErr) {
      console.error("[provision] schools insert error:", schoolErr);
      return NextResponse.json(
        { error: schoolErr.message, details: schoolErr },
        { status: 422 }
      );
    }

    const schoolId = schoolRow.id;

    // ─── Step 2: Academic Year ────────────────────────────────────────────────
    const { data: ayRow, error: ayErr } = await supabase
      .from("academic_years")
      .insert({
        school_id: schoolId,
        name: payload.academicYearName || "Academic Year 2025–2026",
        start_date: payload.startDate || "2025-04-01",
        end_date: payload.endDate || "2026-03-31",
        is_current: true,
      })
      .select("id")
      .single();

    if (ayErr) {
      console.warn("[provision] academic_years insert warning:", ayErr.message);
    }

    const ayId = ayRow?.id;

    // ─── Step 3: Classes & Sections ───────────────────────────────────────────
    const classesToProvision =
      Array.isArray(payload.classes) && payload.classes.length > 0
        ? payload.classes
        : [
            { name: "Class 11 - Senior Secondary", gradeLevel: 11, sections: ["11-A", "11-B"] },
            { name: "Class 12 - Senior Secondary", gradeLevel: 12, sections: ["12-A", "12-B"] },
          ];

    for (const cls of classesToProvision) {
      const { data: clsRow, error: clsErr } = await supabase
        .from("classes")
        .insert({
          school_id: schoolId,
          academic_year_id: ayId,
          name: cls.name,
          grade_level: cls.gradeLevel,
        })
        .select("id")
        .single();

      if (clsErr) {
        console.warn("[provision] class insert warning:", clsErr.message);
        continue;
      }

      const clsId = clsRow?.id;
      if (clsId) {
        for (const secName of cls.sections || []) {
          const { error: secErr } = await supabase.from("sections").insert({
            class_id: clsId,
            name: secName,
            max_capacity: 35,
          });
          if (secErr) {
            console.warn("[provision] section insert warning:", secErr.message);
          }
        }
      }
    }

    // ─── Step 4: Subjects ─────────────────────────────────────────────────────
    const subjectsToProvision =
      Array.isArray(payload.subjects) && payload.subjects.length > 0
        ? payload.subjects
        : ["Mathematics", "Physics", "Chemistry", "Computer Science & AI", "English Core"];

    for (const subjName of subjectsToProvision) {
      const { error: subjErr } = await supabase.from("subjects").insert({
        school_id: schoolId,
        name: subjName,
        code: subjName.slice(0, 3).toUpperCase() + "-101",
        department: "Academics",
      });
      if (subjErr) {
        console.warn("[provision] subject insert warning:", subjErr.message);
      }
    }

    // ─── Step 5: Mark school ACTIVE ───────────────────────────────────────────
    const { error: activateErr } = await supabase
      .from("schools")
      .update({ status: "ACTIVE" })
      .eq("id", schoolId);

    if (activateErr) {
      console.warn("[provision] activate warning:", activateErr.message);
    }

    // ─── Step 6: Audit log ────────────────────────────────────────────────────
    await supabase.from("audit_logs").insert({
      school_id: schoolId,
      actor_id: actorId,
      action: "SCHOOL_PROVISIONED",
      entity_table: "schools",
      entity_id: schoolId,
      new_values: {
        name: payload.name,
        code: schoolCode,
        organization_id: orgId,
      },
    });

    return NextResponse.json({
      success: true,
      school: {
        id: schoolId,
        organization_id: orgId,
        name: payload.legalName || payload.name,
        legal_name: payload.legalName || payload.name,
        slug: payload.slug,
        school_code: schoolCode,
        domain: `${payload.slug}.agragati.edu`,
        currency: payload.currency || "INR",
        base_currency: payload.currency || "INR",
        status: "ACTIVE",
        city: payload.city || "",
        created_at: schoolRow.created_at,
      },
    });
  } catch (err: any) {
    console.error("[provision] Unexpected error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
