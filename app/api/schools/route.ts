/**
 * AGRAGATI PLATFORM — School CRUD API Route
 * GET    /api/schools - List schools
 * POST   /api/schools - Create new school
 * PATCH  /api/schools - Update school status/settings
 * DELETE /api/schools - Delete school
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  listOrganizationSchools,
  updateOrganizationSchoolStatus,
  deleteOrganizationSchool,
  provisionSchool,
} from "@/lib/services/organization-service";

function createServiceClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://mbvnljezznpgzworwpag.supabase.co";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idm5samV6em5wZ3p3b3J3cGFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUzMTIwNSwiZXhwIjoyMTA0MTA3MjA1fQ.HDRClM_DmdHxb7PdRL28idFn-tKG_b72AqeHcJe57_U";

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// GET /api/schools?orgId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || "e0000000-0000-0000-0000-000000000001";
    const schools = await listOrganizationSchools(orgId);
    return NextResponse.json({ success: true, schools });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/schools
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, actorId, payload } = body;
    const school = await provisionSchool(
      orgId || "e0000000-0000-0000-0000-000000000001",
      actorId || "usr-owner-01",
      payload
    );
    return NextResponse.json({ success: true, school });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/schools
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { schoolId, status, actorId } = body;
    if (!schoolId || !status) {
      return NextResponse.json({ error: "schoolId and status required" }, { status: 400 });
    }

    // Server-side service_role update
    try {
      const supabase = createServiceClient();
      await supabase.from("schools").update({ status }).eq("id", schoolId);
    } catch (err) {
      console.warn("API PATCH fallback:", err);
    }

    const res = await updateOrganizationSchoolStatus(schoolId, status, actorId);
    return NextResponse.json({ success: true, school: res.school });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/schools?id=...
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("id");
    if (!schoolId) {
      return NextResponse.json({ error: "schoolId parameter 'id' required" }, { status: 400 });
    }

    // Server-side service_role delete with full foreign-key cleanup
    try {
      const supabase = createServiceClient();
      await supabase.from("users_profiles").delete().eq("school_id", schoolId);
      await supabase.from("students").delete().eq("school_id", schoolId);
      await supabase.from("teachers").delete().eq("school_id", schoolId);
      await supabase.from("invoices").delete().eq("school_id", schoolId);
      await supabase.from("fee_structures").delete().eq("school_id", schoolId);
      await supabase.from("notices").delete().eq("school_id", schoolId);
      await supabase.from("subjects").delete().eq("school_id", schoolId);
      await supabase.from("sections").delete().eq("school_id", schoolId);
      await supabase.from("classes").delete().eq("school_id", schoolId);
      await supabase.from("academic_years").delete().eq("school_id", schoolId);
      await supabase.from("audit_logs").delete().eq("school_id", schoolId);
      await supabase.from("schools").delete().eq("id", schoolId);
    } catch (err) {
      console.warn("API DELETE fallback:", err);
    }

    const res = await deleteOrganizationSchool(schoolId);
    return NextResponse.json({ success: true, schoolId: res.schoolId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

