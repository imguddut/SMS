import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { UserRole, CanonicalUserRole, normalizeRole, getRoleHomeRoute } from "@/types/roles";

export { getRoleHomeRoute };

interface CookieToSet {
  name: string;
  value: string;
  options: CookieOptions;
}

// ---------------------------------------------------------------------------
// Role → allowed route prefixes mapping
// ---------------------------------------------------------------------------

const ROLE_ROUTE_MAP: Record<CanonicalUserRole, string[]> = {
  PLATFORM_ADMIN: ["/platform", "/platform-admin"],
  ORGANIZATION_OWNER: ["/organization", "/owner"],
  ORGANIZATION_ADMIN: ["/organization", "/owner"],
  ORGANIZATION_FINANCE: ["/organization", "/owner", "/finance"],
  ORGANIZATION_VIEWER: ["/organization", "/owner"],
  PRINCIPAL: ["/school"],
  SCHOOL_ADMIN: ["/school"],
  TEACHER: ["/teacher"],
  ACCOUNTANT: ["/finance"],
  PARENT: ["/parent"],
  STUDENT: ["/student"],
};

function getRoleFromPath(path: string): CanonicalUserRole | null {
  if (path.startsWith("/platform") || path.startsWith("/platform-admin")) return "PLATFORM_ADMIN";
  if (path.startsWith("/organization") || path.startsWith("/owner")) return "ORGANIZATION_OWNER";
  if (path.startsWith("/school")) return "SCHOOL_ADMIN";
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
    path === "/login" ||
    path === "/forgot-password" ||
    path === "/reset-password" ||
    path.startsWith("/auth");

  const isStaticAsset =
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/favicon.ico") ||
    path.includes(".");

  if (isStaticAsset) {
    return supabaseResponse;
  }

  // 1. Unauthenticated users trying to access protected routes -> redirect to /login
  if (!isAuthenticated && !isAuthPage && path !== "/") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users visiting / or /login -> redirect to their portal
  if (isAuthenticated && (isAuthPage || path === "/")) {
    const canonical = normalizeRole(activeRole);
    const targetRoute = getRoleHomeRoute(canonical);
    return NextResponse.redirect(new URL(targetRoute, request.url));
  }

  // 3. Role-based Route Protection (Prevent cross-portal privilege escalation)
  if (isAuthenticated && activeRole) {
    const requiredRoleForPath = getRoleFromPath(path);
    if (requiredRoleForPath) {
      const canonicalUserRole = normalizeRole(activeRole);
      const allowedPrefixes = ROLE_ROUTE_MAP[canonicalUserRole] || [];
      const hasAccess = allowedPrefixes.some((prefix) => path.startsWith(prefix));

      if (!hasAccess) {
        // Redirect to their own authorized portal home
        const fallbackRoute = getRoleHomeRoute(canonicalUserRole);
        return NextResponse.redirect(new URL(fallbackRoute, request.url));
      }
    }
  }

  return supabaseResponse;
}
