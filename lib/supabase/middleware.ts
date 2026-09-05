import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { UserRole } from "@/types/auth";

interface CookieToSet {
  name: string;
  value: string;
  options: CookieOptions;
}

// ---------------------------------------------------------------------------
// Role → allowed route prefixes mapping
// ---------------------------------------------------------------------------

const ROLE_ROUTE_MAP: Record<UserRole, string[]> = {
  SUPER_ADMIN: ["/platform-admin"],
  OWNER: ["/owner"],
  PRINCIPAL: ["/school"],
  SCHOOL_ADMIN: ["/school"],
  TEACHER: ["/teacher"],
  ACCOUNTANT: ["/finance"],
  PARENT: ["/parent"],
  STUDENT: ["/student"],
};

function getRoleFromPath(path: string): UserRole | null {
  if (path.startsWith("/platform-admin")) return "SUPER_ADMIN";
  if (path.startsWith("/owner")) return "OWNER";
  if (path.startsWith("/school")) return "SCHOOL_ADMIN"; // PRINCIPAL shares this
  if (path.startsWith("/teacher")) return "TEACHER";
  if (path.startsWith("/finance")) return "ACCOUNTANT";
  if (path.startsWith("/parent")) return "PARENT";
  if (path.startsWith("/student")) return "STUDENT";
  return null;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Check demo session cookie
  const demoSession = request.cookies.get("agragati_session")?.value;
  const demoRole = request.cookies.get("agragati_role")?.value as UserRole | undefined;

  // Check Supabase Auth safely
  let hasSupabaseUser = false;
  let supabaseUserRole: UserRole | null = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          try {
            return request.cookies.getAll();
          } catch {
            return [];
          }
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          } catch {
            // Ignore cookie setting errors in middleware
          }
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      hasSupabaseUser = true;
      // Extract role from user metadata
      supabaseUserRole = (user.user_metadata?.role as UserRole) || null;
    }
  } catch {
    // Gracefully catch Supabase token parse errors
  }

  const isAuthenticated = hasSupabaseUser || Boolean(demoSession);
  const activeRole: UserRole | null = supabaseUserRole || demoRole || null;

  // Public paths
  const isAuthPage =
    path.startsWith("/login") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/auth");

  // Protect internal routes if unauthenticated
  if (!isAuthenticated && !isAuthPage && path !== "/") {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Role-based route enforcement: prevent accessing another role's portal
  if (isAuthenticated && activeRole && !isAuthPage && path !== "/") {
    const targetRole = getRoleFromPath(path);
    if (targetRole) {
      const allowedPrefixes = ROLE_ROUTE_MAP[activeRole];
      // PRINCIPAL can also access /school routes
      const isAllowed = allowedPrefixes?.some((prefix) => path.startsWith(prefix));
      // Also allow PRINCIPAL to access school routes
      const isPrincipalOnSchool = activeRole === "PRINCIPAL" && path.startsWith("/school");

      if (!isAllowed && !isPrincipalOnSchool) {
        // Redirect to the user's own portal home
        url.pathname = getRoleHomeRoute(activeRole);
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export function getRoleHomeRoute(role: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/platform-admin/overview";
    case "OWNER":
      return "/owner/overview";
    case "PRINCIPAL":
    case "SCHOOL_ADMIN":
      return "/school/overview";
    case "TEACHER":
      return "/teacher/my-day";
    case "ACCOUNTANT":
      return "/finance/dashboard";
    case "PARENT":
      return "/parent/home";
    case "STUDENT":
      return "/student/home";
    default:
      return "/login";
  }
}
