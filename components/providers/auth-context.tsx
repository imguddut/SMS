/**
 * AGRAGATI PLATFORM — Multi-Tenant Auth Context Provider
 *
 * Implements:
 * - Global User Profile
 * - Multi-organization & Multi-school memberships
 * - Dynamic Organization Switcher & School Switcher
 * - All Schools aggregate mode
 * - Backward compatible session accessors
 */
"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  UserRole,
  UserProfile,
  OrganizationTenant,
  OrganizationMembership,
  SchoolTenant,
  SchoolMembership,
} from "@/types/auth";
import { normalizeRole, isOrganizationScoped } from "@/types/roles";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuthProfile = UserProfile;
export type AuthSchool = SchoolTenant;
export type AuthOrganization = OrganizationTenant;

export interface AuthState {
  /** Supabase auth user ID */
  userId: string | null;
  /** User profile (global identity) */
  profile: AuthProfile | null;
  /** Active Organization Tenant */
  currentOrganization: AuthOrganization | null;
  /** Active School Tenant */
  currentSchool: AuthSchool | null;
  /** All Organization Memberships for this user */
  organizations: OrganizationMembership[];
  /** All School Memberships for this user */
  schools: SchoolMembership[];
  /** Effective active role in the current operational scope */
  activeRole: UserRole | null;
  /** Whether the user is in "All Schools" aggregate view (Org level) */
  allSchoolsMode: boolean;
  /** Set "All Schools" aggregate view mode */
  setAllSchoolsMode: (enabled: boolean) => void;
  /** Switch active organization context */
  switchOrganization: (orgId: string) => Promise<void>;
  /** Switch active school context */
  switchSchool: (schoolId: string) => Promise<void>;

  // Backward compatibility accessors
  /** Convenience: user role */
  role: UserRole | null;
  /** Convenience: school tenant */
  school: AuthSchool | null;
  /** Convenience: school_id */
  schoolId: string | null;
  /** Convenience: organization_id */
  organizationId: string | null;
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
  currentOrganization: null,
  currentSchool: null,
  organizations: [],
  schools: [],
  activeRole: null,
  allSchoolsMode: false,
  setAllSchoolsMode: () => {},
  switchOrganization: async () => {},
  switchSchool: async () => {},
  role: null,
  school: null,
  schoolId: null,
  organizationId: null,
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

function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

// ---------------------------------------------------------------------------
// Provider Component
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<AuthProfile | null>(null);
  const [currentOrganization, setCurrentOrganization] = React.useState<AuthOrganization | null>(null);
  const [currentSchool, setCurrentSchool] = React.useState<AuthSchool | null>(null);
  const [organizations, setOrganizations] = React.useState<OrganizationMembership[]>([]);
  const [schools, setSchools] = React.useState<SchoolMembership[]>([]);
  const [activeRole, setActiveRole] = React.useState<UserRole | null>(null);
  const [allSchoolsMode, setAllSchoolsMode] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);

  const loadAuth = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // 1. Try Supabase Auth
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (user && !authError) {
        // Fetch global profile from users_profiles
        const { data: profData } = await supabase
          .from("users_profiles")
          .select("*")
          .eq("auth_user_id", user.id)
          .single();

        if (profData) {
          // Fetch Organization memberships
          const { data: orgMems } = await supabase
            .from("organization_memberships")
            .select(`
              *,
              organizations (*)
            `)
            .eq("profile_id", profData.id);

          // Fetch School memberships
          const { data: schMems } = await supabase
            .from("school_memberships")
            .select(`
              *,
              schools (*)
            `)
            .eq("profile_id", profData.id);

          const orgMemberships: OrganizationMembership[] = (orgMems || []).map((m: any) => ({
            id: m.id,
            organization_id: m.organization_id,
            profile_id: m.profile_id,
            role: m.role,
            status: m.status,
            created_at: m.created_at,
            organization: m.organizations,
          }));

          const schoolMemberships: SchoolMembership[] = (schMems || []).map((m: any) => ({
            id: m.id,
            school_id: m.school_id,
            profile_id: m.profile_id,
            role: m.role,
            status: m.status,
            is_primary: m.is_primary,
            joined_at: m.joined_at,
            school: m.schools,
          }));

          // Pick active org and school
          const savedOrgId = getCookie("agragati_org_id");
          const savedSchId = getCookie("agragati_school_id");

          const activeOrg =
            orgMemberships.find((o) => o.organization_id === savedOrgId)?.organization ||
            orgMemberships[0]?.organization ||
            null;

          const activeSch =
            schoolMemberships.find((s) => s.school_id === savedSchId)?.school ||
            schoolMemberships[0]?.school ||
            null;

          const resolvedRole: UserRole =
            orgMemberships[0]?.role ||
            schoolMemberships[0]?.role ||
            (profData.role as UserRole) ||
            "STUDENT";

          setUserId(user.id);
          setProfile({
            ...profData,
            school_id: activeSch?.id || profData.school_id || null,
            role: resolvedRole,
          } as AuthProfile);
          setCurrentOrganization(activeOrg);
          setCurrentSchool(activeSch);
          setOrganizations(orgMemberships);
          setSchools(schoolMemberships);
          setActiveRole(resolvedRole);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      }

      // Unauthenticated / No Supabase Auth user context
      setUserId(null);
      setProfile(null);
      setCurrentOrganization(null);
      setCurrentSchool(null);
      setOrganizations([]);
      setSchools([]);
      setActiveRole(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    } catch (err) {
      console.warn("AuthProvider auth error:", err);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  const switchOrganization = React.useCallback(
    async (orgId: string) => {
      setCookie("agragati_org_id", orgId);
      const matched = organizations.find((o) => o.organization_id === orgId)?.organization;
      if (matched) {
        setCurrentOrganization(matched);
      } else {
        try {
          const supabase = createClient();
          const { data: org } = await supabase.from("organizations").select("*").eq("id", orgId).single();
          if (org) setCurrentOrganization(org as AuthOrganization);
        } catch {
          // ignore
        }
      }
    },
    [organizations]
  );

  const switchSchool = React.useCallback(
    async (schoolId: string) => {
      setCookie("agragati_school_id", schoolId);
      setAllSchoolsMode(false);
      const matched = schools.find((s) => s.school_id === schoolId)?.school;
      if (matched) {
        setCurrentSchool(matched);
      } else {
        try {
          const supabase = createClient();
          const { data: sch } = await supabase.from("schools").select("*").eq("id", schoolId).single();
          if (sch) setCurrentSchool(sch as AuthSchool);
        } catch {
          // ignore
        }
      }
    },
    [schools]
  );

  const signOut = React.useCallback(async () => {
    deleteCookie("agragati_session");
    deleteCookie("agragati_role");
    deleteCookie("agragati_org_id");
    deleteCookie("agragati_school_id");
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    setUserId(null);
    setProfile(null);
    setCurrentOrganization(null);
    setCurrentSchool(null);
    setActiveRole(null);
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  const value = React.useMemo<AuthState>(
    () => ({
      userId,
      profile,
      currentOrganization,
      currentSchool,
      organizations,
      schools,
      activeRole,
      allSchoolsMode,
      setAllSchoolsMode,
      switchOrganization,
      switchSchool,
      role: activeRole,
      school: currentSchool,
      schoolId: currentSchool?.id || null,
      organizationId: currentOrganization?.id || null,
      isLoading,
      isAuthenticated,
      signOut,
      refresh: loadAuth,
    }),
    [
      userId,
      profile,
      currentOrganization,
      currentSchool,
      organizations,
      schools,
      activeRole,
      allSchoolsMode,
      switchOrganization,
      switchSchool,
      isLoading,
      isAuthenticated,
      signOut,
      loadAuth,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
