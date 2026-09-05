/**
 * AGRAGATI SCHOOL OS — Auth Context Provider
 *
 * Provides authenticated user identity across all portals.
 * Reads from Supabase Auth + users_profiles table.
 * Falls back to cookie-based demo session for backward compatibility.
 */
"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthProfile {
  id: string;
  auth_user_id: string;
  school_id: string | null;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  title: string | null;
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
  metadata: Record<string, unknown>;
}

export interface AuthSchool {
  id: string;
  legal_name: string;
  slug: string;
  domain: string | null;
  base_currency: string;
  logo_url: string | null;
  status: string;
}

export interface AuthState {
  /** Supabase auth user ID (if authenticated via Supabase) */
  userId: string | null;
  /** User profile from users_profiles table */
  profile: AuthProfile | null;
  /** School tenant the user belongs to */
  school: AuthSchool | null;
  /** Convenience: user role */
  role: UserRole | null;
  /** Convenience: school_id */
  schoolId: string | null;
  /** Whether auth state is still loading */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Sign out and clear session */
  signOut: () => Promise<void>;
  /** Refresh auth state */
  refresh: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = React.createContext<AuthState>({
  userId: null,
  profile: null,
  school: null,
  role: null,
  schoolId: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refresh: async () => {},
});

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

// ---------------------------------------------------------------------------
// Fallback profile from cookie (demo mode / offline)
// ---------------------------------------------------------------------------

const DEMO_PROFILES: Record<UserRole, Omit<AuthProfile, "auth_user_id"> & { auth_user_id: string }> = {
  SUPER_ADMIN: {
    id: "b0000000-0000-0000-0000-000000000001",
    auth_user_id: "a0000000-0000-0000-0000-000000000001",
    school_id: null,
    role: "SUPER_ADMIN",
    full_name: "Mr. Rajesh Pillai",
    email: "superadmin@agragati.edu",
    phone: null,
    avatar_url: null,
    title: "Platform Lead & Super Admin",
    status: "ACTIVE",
    metadata: {},
  },
  OWNER: {
    id: "b0000000-0000-0000-0000-000000000002",
    auth_user_id: "a0000000-0000-0000-0000-000000000002",
    school_id: "11111111-1111-1111-1111-111111111111",
    role: "OWNER",
    full_name: "Julian Vance-Moreau, D.Phil",
    email: "owner@kingscollege.edu",
    phone: null,
    avatar_url: null,
    title: "Chancellor & CFO",
    status: "ACTIVE",
    metadata: {},
  },
  PRINCIPAL: {
    id: "b0000000-0000-0000-0000-000000000003",
    auth_user_id: "a0000000-0000-0000-0000-000000000003",
    school_id: "11111111-1111-1111-1111-111111111111",
    role: "PRINCIPAL",
    full_name: "Mme. Claire De La Tour",
    email: "principal@kingscollege.edu",
    phone: null,
    avatar_url: null,
    title: "Head of School / Principal",
    status: "ACTIVE",
    metadata: {},
  },
  SCHOOL_ADMIN: {
    id: "b0000000-0000-0000-0000-000000000004",
    auth_user_id: "a0000000-0000-0000-0000-000000000004",
    school_id: "11111111-1111-1111-1111-111111111111",
    role: "SCHOOL_ADMIN",
    full_name: "Henrietta Sterling",
    email: "admin@kingscollege.edu",
    phone: null,
    avatar_url: null,
    title: "School Operations Administrator",
    status: "ACTIVE",
    metadata: {},
  },
  TEACHER: {
    id: "b0000000-0000-0000-0000-000000000005",
    auth_user_id: "a0000000-0000-0000-0000-000000000005",
    school_id: "11111111-1111-1111-1111-111111111111",
    role: "TEACHER",
    full_name: "Dr. Alistair Finch",
    email: "teacher@kingscollege.edu",
    phone: null,
    avatar_url: null,
    title: "Senior Faculty • Physics",
    status: "ACTIVE",
    metadata: {},
  },
  ACCOUNTANT: {
    id: "b0000000-0000-0000-0000-000000000006",
    auth_user_id: "a0000000-0000-0000-0000-000000000006",
    school_id: "11111111-1111-1111-1111-111111111111",
    role: "ACCOUNTANT",
    full_name: "Arthur M. Vance",
    email: "finance@kingscollege.edu",
    phone: null,
    avatar_url: null,
    title: "Chief Bursar & Comptroller",
    status: "ACTIVE",
    metadata: {},
  },
  PARENT: {
    id: "b0000000-0000-0000-0000-000000000007",
    auth_user_id: "a0000000-0000-0000-0000-000000000007",
    school_id: "11111111-1111-1111-1111-111111111111",
    role: "PARENT",
    full_name: "Marcus Laurent",
    email: "parent@kingscollege.edu",
    phone: null,
    avatar_url: null,
    title: "Guardian • Senior Form",
    status: "ACTIVE",
    metadata: {},
  },
  STUDENT: {
    id: "b0000000-0000-0000-0000-000000000008",
    auth_user_id: "a0000000-0000-0000-0000-000000000008",
    school_id: "11111111-1111-1111-1111-111111111111",
    role: "STUDENT",
    full_name: "Genevieve Laurent",
    email: "student@kingscollege.edu",
    phone: null,
    avatar_url: null,
    title: "Scholar • Grade 11-IB",
    status: "ACTIVE",
    metadata: {},
  },
};

const DEMO_SCHOOL: AuthSchool = {
  id: "11111111-1111-1111-1111-111111111111",
  legal_name: "The King's College & Academy",
  slug: "kingscollege",
  domain: "kingscollege.agragati.edu",
  base_currency: "CHF",
  logo_url: null,
  status: "ACTIVE",
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<Omit<AuthState, "signOut" | "refresh">>({
    userId: null,
    profile: null,
    school: null,
    role: null,
    schoolId: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadAuth = React.useCallback(async () => {
    try {
      const supabase = createClient();

      // 1. Try Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (user && !authError) {
        // Fetch profile from users_profiles
        const { data: profile } = await supabase
          .from("users_profiles")
          .select("*")
          .eq("auth_user_id", user.id)
          .single();

        if (profile) {
          let school: AuthSchool | null = null;
          if (profile.school_id) {
            const { data: schoolData } = await supabase
              .from("schools")
              .select("id, legal_name, slug, domain, base_currency, logo_url, status")
              .eq("id", profile.school_id)
              .single();
            school = schoolData || null;
          }

          setState({
            userId: user.id,
            profile: profile as AuthProfile,
            school,
            role: profile.role as UserRole,
            schoolId: profile.school_id,
            isLoading: false,
            isAuthenticated: true,
          });
          return;
        }
      }

      // 2. Fallback: cookie-based demo session
      const sessionCookie = getCookie("agragati_session");
      const roleCookie = getCookie("agragati_role") as UserRole | null;

      if (sessionCookie && roleCookie && DEMO_PROFILES[roleCookie]) {
        const demoProfile = DEMO_PROFILES[roleCookie];
        setState({
          userId: demoProfile.auth_user_id,
          profile: demoProfile,
          school: demoProfile.school_id ? DEMO_SCHOOL : null,
          role: roleCookie,
          schoolId: demoProfile.school_id,
          isLoading: false,
          isAuthenticated: true,
        });
        return;
      }

      // 3. Not authenticated
      setState({
        userId: null,
        profile: null,
        school: null,
        role: null,
        schoolId: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (err) {
      console.warn("AuthProvider: Error loading auth state:", err);

      // Last-resort fallback: check cookie
      const roleCookie = getCookie("agragati_role") as UserRole | null;
      if (roleCookie && DEMO_PROFILES[roleCookie]) {
        const demoProfile = DEMO_PROFILES[roleCookie];
        setState({
          userId: demoProfile.auth_user_id,
          profile: demoProfile,
          school: demoProfile.school_id ? DEMO_SCHOOL : null,
          role: roleCookie,
          schoolId: demoProfile.school_id,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState({
          userId: null,
          profile: null,
          school: null,
          role: null,
          schoolId: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    }
  }, []);

  React.useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  // Listen for Supabase auth state changes (login/logout in another tab)
  React.useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, _session) => {
      loadAuth();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [loadAuth]);

  const signOut = React.useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore sign-out errors
    }
    deleteCookie("agragati_session");
    deleteCookie("agragati_role");
    setState({
      userId: null,
      profile: null,
      school: null,
      role: null,
      schoolId: null,
      isLoading: false,
      isAuthenticated: false,
    });
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  const value: AuthState = React.useMemo(
    () => ({
      ...state,
      signOut,
      refresh: loadAuth,
    }),
    [state, signOut, loadAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthState {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Helper: get the current school_id for Supabase queries.
 * Returns the school_id from auth context, or the hardcoded seed school ID as fallback.
 */
export function useSchoolId(): string {
  const { schoolId } = useAuth();
  return schoolId || "11111111-1111-1111-1111-111111111111";
}
