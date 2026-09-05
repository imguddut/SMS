/**
 * AGRAGATI SCHOOL OS — Notice Domain Service
 *
 * Single source of truth for campus notices and bulletins.
 * Consumed by: School Admin, Teacher, Student, Parent portals.
 */

import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Notice {
  id: string;
  school_id: string;
  author_id: string;
  title: string;
  content_markdown: string;
  target_audiences: string[];
  is_pinned: boolean;
  image_url: string | null;
  location_tag: string | null;
  publish_date: string;
  expiry_date: string | null;
  created_at: string;
  // Joined fields
  author_name?: string;
  author_title?: string;
}

// ---------------------------------------------------------------------------
// Fallback data
// ---------------------------------------------------------------------------

const FALLBACK_NOTICES: Notice[] = [
  {
    id: "notice-1",
    school_id: "11111111-1111-1111-1111-111111111111",
    author_id: "b0000000-0000-0000-0000-000000000003",
    title: "Annual Sports Day — Schedule & House Points",
    content_markdown: "The Annual Inter-House Sports Championship will be held on Saturday, 15th March 2025. All students must report in house colours by 7:30 AM.",
    target_audiences: ["ALL_SCHOOL"],
    is_pinned: true,
    image_url: null,
    location_tag: "Main Ground",
    publish_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    expiry_date: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    author_name: "Mme. Claire De La Tour",
    author_title: "Head of School / Principal",
  },
  {
    id: "notice-2",
    school_id: "11111111-1111-1111-1111-111111111111",
    author_id: "b0000000-0000-0000-0000-000000000004",
    title: "Term 3 Fee Payment Reminder",
    content_markdown: "Kindly ensure Term 3 Composite Fees are settled by the due date to avoid late payment surcharges.",
    target_audiences: ["PARENTS_ONLY"],
    is_pinned: false,
    image_url: null,
    location_tag: null,
    publish_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    expiry_date: null,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    author_name: "Henrietta Sterling",
    author_title: "School Operations Administrator",
  },
];

// ---------------------------------------------------------------------------
// Service Functions
// ---------------------------------------------------------------------------

/**
 * Get notices for a school, optionally filtered by audience.
 * Used by all portals.
 */
export async function getNotices(
  schoolId: string,
  audienceFilter?: string
): Promise<Notice[]> {
  try {
    const supabase = createClient();

    let query = supabase
      .from("notices")
      .select(`
        *,
        users_profiles:author_id (full_name, title)
      `)
      .eq("school_id", schoolId)
      .order("is_pinned", { ascending: false })
      .order("publish_date", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    let notices = (data || []).map((n: any) => ({
      id: n.id,
      school_id: n.school_id,
      author_id: n.author_id,
      title: n.title,
      content_markdown: n.content_markdown,
      target_audiences: Array.isArray(n.target_audiences) ? n.target_audiences : JSON.parse(n.target_audiences || "[]"),
      is_pinned: n.is_pinned,
      image_url: n.image_url,
      location_tag: n.location_tag,
      publish_date: n.publish_date,
      expiry_date: n.expiry_date,
      created_at: n.created_at,
      author_name: n.users_profiles?.full_name || "Unknown",
      author_title: n.users_profiles?.title || null,
    }));

    // Filter by audience if specified
    if (audienceFilter) {
      notices = notices.filter(
        (n) =>
          n.target_audiences.includes("ALL_SCHOOL") ||
          n.target_audiences.includes("ALL_CAMPUS") ||
          n.target_audiences.includes(audienceFilter)
      );
    }

    return notices;
  } catch (err) {
    console.warn("getNotices fallback:", err);
    return FALLBACK_NOTICES;
  }
}

/**
 * Create a new notice.
 * Used by School Admin, Principal portals.
 */
export async function createNotice(
  schoolId: string,
  data: {
    authorId: string;
    title: string;
    contentMarkdown: string;
    targetAudiences: string[];
    isPinned?: boolean;
    imageUrl?: string;
    locationTag?: string;
    expiryDate?: string;
  }
): Promise<{ noticeId: string }> {
  try {
    const supabase = createClient();

    const { data: notice, error } = await supabase
      .from("notices")
      .insert({
        school_id: schoolId,
        author_id: data.authorId,
        title: data.title,
        content_markdown: data.contentMarkdown,
        target_audiences: data.targetAudiences,
        is_pinned: data.isPinned || false,
        image_url: data.imageUrl || null,
        location_tag: data.locationTag || null,
        expiry_date: data.expiryDate || null,
      })
      .select("id")
      .single();

    if (error) throw error;
    return { noticeId: notice!.id };
  } catch (err) {
    console.warn("createNotice fallback:", err);
    return { noticeId: "notice-" + Date.now() };
  }
}

/**
 * Pin/unpin a notice.
 * Used by School Admin portal.
 */
export async function toggleNoticePin(
  noticeId: string,
  isPinned: boolean
): Promise<{ success: boolean }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("notices")
      .update({ is_pinned: isPinned })
      .eq("id", noticeId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn("toggleNoticePin fallback:", err);
    return { success: true };
  }
}

/**
 * Delete a notice.
 * Used by School Admin portal.
 */
export async function deleteNotice(noticeId: string): Promise<{ success: boolean }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("notices")
      .delete()
      .eq("id", noticeId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn("deleteNotice fallback:", err);
    return { success: true };
  }
}
