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
// Seed Data (Multi-Tenant Offline / Demo Mode)
// ---------------------------------------------------------------------------

const DEMO_ORGANIZATION_A: AuthOrganization = {
  id: "e0000000-0000-0000-0000-000000000001",
  platform_id: "00000000-0000-0000-0000-000000000001",
  name: "King's Educational Trust",
  slug: "kings-trust",
  legal_name: "The King's Educational Trust & Foundation",
  organization_type: "TRUST",
  registration_number: "KET-REG-2018-9842",
  city: "Geneva",
  state: "Geneva Canton",
  country: "Switzerland",
  status: "ACTIVE",
  subscription_plan: "ENTERPRISE_FLEET",
  subscription_status: "ACTIVE",
  created_at: new Date().toISOString(),
};

const DEMO_ORGANIZATION_B: AuthOrganization = {
  id: "e0000000-0000-0000-0000-000000000002",
  platform_id: "00000000-0000-0000-0000-000000000001",
  name: "ABC Education Society",
  slug: "abc-society",
  legal_name: "ABC Education Society Foundation",
  organization_type: "SOCIETY",
  registration_number: "ABC-SOC-2021-4410",
  city: "New Delhi",
  state: "Delhi",
  country: "India",
  status: "ACTIVE",
  subscription_plan: "STANDARD",
  subscription_status: "ACTIVE",
  created_at: new Date().toISOString(),
};

const DEMO_SCHOOL_A1: AuthSchool = {
  id: "11111111-1111-1111-1111-111111111111",
  organization_id: "e0000000-0000-0000-0000-000000000001",
  legal_name: "The King's College & Academy",
  name: "The King's College & Academy",
  slug: "kingscollege",
  school_code: "KC-01",
  domain: "kingscollege.agragati.edu",
  currency: "CHF",
  base_currency: "CHF",
  status: "ACTIVE",
  city: "Geneva",
  created_at: new Date().toISOString(),
};

const DEMO_SCHOOL_A2: AuthSchool = {
  id: "11111111-1111-1111-1111-111111111112",
  organization_id: "e0000000-0000-0000-0000-000000000001",
  legal_name: "King's Preparatory Grammar School",
  name: "King's Preparatory Grammar School",
  slug: "kingsprep",
  school_code: "KC-PREP-02",
  domain: "prep.kingscollege.edu",
  currency: "CHF",
  base_currency: "CHF",
  status: "ACTIVE",
  city: "Lausanne",
  created_at: new Date().toISOString(),
};

const DEMO_SCHOOL_B1: AuthSchool = {
  id: "22222222-2222-2222-2222-222222222222",
  organization_id: "e0000000-0000-0000-0000-000000000002",
  legal_name: "ABC Public Senior School",
  name: "ABC Public Senior School",
  slug: "abc-senior-school",
  school_code: "ABC-01",
  domain: "abcschool.agragati.edu",
  currency: "INR",
  base_currency: "INR",
  status: "ACTIVE",
  city: "New Delhi",
  created_at: new Date().toISOString(),
};

const DEMO_PROFILES: Record<UserRole, AuthProfile> = {
  PLATFORM_ADMIN: {
    id: "b0000000-0000-0000-0000-000000000001",
    auth_user_id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Eleanor Vance",
    email: "superadmin@agragati.edu",
    title: "Platform Lead & National Admin",
    status: "ACTIVE",
    role: "PLATFORM_ADMIN",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  SUPER_ADMIN: {
    id: "b0000000-0000-0000-0000-000000000001",
    auth_user_id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Eleanor Vance",
    email: "superadmin@agragati.edu",
    title: "Platform Lead & Super Admin",
    status: "ACTIVE",
    role: "SUPER_ADMIN",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  ORGANIZATION_OWNER: {
    id: "b0000000-0000-0000-0000-000000000002",
    auth_user_id: "a0000000-0000-0000-0000-000000000002",
    full_name: "Julian Vance-Moreau, D.Phil",
    email: "owner@kingscollege.edu",
    title: "Trust Chairman & Founder",
    status: "ACTIVE",
    role: "ORGANIZATION_OWNER",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  ORGANIZATION_ADMIN: {
    id: "b0000000-0000-0000-0000-000000000002",
    auth_user_id: "a0000000-0000-0000-0000-000000000002",
    full_name: "Julian Vance-Moreau, D.Phil",
    email: "owner@kingscollege.edu",
    title: "Chief Executive Officer",
    status: "ACTIVE",
    role: "ORGANIZATION_ADMIN",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  ORGANIZATION_FINANCE: {
    id: "b0000000-0000-0000-0000-000000000006",
    auth_user_id: "a0000000-0000-0000-0000-000000000006",
    full_name: "Arthur M. Vance",
    email: "finance@kingscollege.edu",
    title: "Trust Financial Controller",
    status: "ACTIVE",
    role: "ORGANIZATION_FINANCE",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  ORGANIZATION_VIEWER: {
    id: "b0000000-0000-0000-0000-000000000002",
    auth_user_id: "a0000000-0000-0000-0000-000000000002",
    full_name: "Julian Vance-Moreau, D.Phil",
    email: "owner@kingscollege.edu",
    title: "Trustee & Observer",
    status: "ACTIVE",
    role: "ORGANIZATION_VIEWER",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  TRUST_CHAIRMAN: {
    id: "b0000000-0000-0000-0000-000000000002",
    auth_user_id: "a0000000-0000-0000-0000-000000000002",
    full_name: "Julian Vance-Moreau, D.Phil",
    email: "owner@kingscollege.edu",
    title: "Trust Chairman & Trustee",
    status: "ACTIVE",
    role: "ORGANIZATION_OWNER",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  CEO: {
    id: "b0000000-0000-0000-0000-000000000002",
    auth_user_id: "a0000000-0000-0000-0000-000000000002",
    full_name: "Julian Vance-Moreau, D.Phil",
    email: "owner@kingscollege.edu",
    title: "Chief Executive Officer",
    status: "ACTIVE",
    role: "ORGANIZATION_ADMIN",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  OWNER: {
    id: "b0000000-0000-0000-0000-000000000002",
    auth_user_id: "a0000000-0000-0000-0000-000000000002",
    full_name: "Julian Vance-Moreau, D.Phil",
    email: "owner@kingscollege.edu",
    title: "Chancellor & Founder",
    status: "ACTIVE",
    role: "ORGANIZATION_OWNER",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  PRINCIPAL: {
    id: "b0000000-0000-0000-0000-000000000003",
    auth_user_id: "a0000000-0000-0000-0000-000000000003",
    full_name: "Mme. Claire De La Tour",
    email: "principal@kingscollege.edu",
    title: "Head of School / Principal",
    status: "ACTIVE",
    role: "PRINCIPAL",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  SCHOOL_ADMIN: {
    id: "b0000000-0000-0000-0000-000000000004",
    auth_user_id: "a0000000-0000-0000-0000-000000000004",
    full_name: "Henrietta Sterling",
    email: "admin@kingscollege.edu",
    title: "School Operations Administrator",
    status: "ACTIVE",
    role: "SCHOOL_ADMIN",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  TEACHER: {
    id: "b0000000-0000-0000-0000-000000000005",
    auth_user_id: "a0000000-0000-0000-0000-000000000005",
    full_name: "Dr. Alistair Finch",
    email: "teacher@kingscollege.edu",
    title: "Senior Faculty • Physics",
    status: "ACTIVE",
    role: "TEACHER",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  ACCOUNTANT: {
    id: "b0000000-0000-0000-0000-000000000006",
    auth_user_id: "a0000000-0000-0000-0000-000000000006",
    full_name: "Arthur M. Vance",
    email: "finance@kingscollege.edu",
    title: "Chief Bursar & Comptroller",
    status: "ACTIVE",
    role: "ACCOUNTANT",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  PARENT: {
    id: "b0000000-0000-0000-0000-000000000007",
    auth_user_id: "a0000000-0000-0000-0000-000000000007",
    full_name: "Marcus Laurent",
    email: "parent@kingscollege.edu",
    title: "Guardian • Senior Form",
    status: "ACTIVE",
    role: "PARENT",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  STUDENT: {
    id: "b0000000-0000-0000-0000-000000000008",
    auth_user_id: "a0000000-0000-0000-0000-000000000008",
    full_name: "Genevieve Laurent",
    email: "student@kingscollege.edu",
    title: "Scholar • Grade 11-IB",
    status: "ACTIVE",
    role: "STUDENT",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  BURSAR: {
    id: "b0000000-0000-0000-0000-000000000006",
    auth_user_id: "a0000000-0000-0000-0000-000000000006",
    full_name: "Montgomery Sterling, CPA",
    email: "finance@kingscollege.edu",
    title: "Bursar & Chief Financial Officer",
    status: "ACTIVE",
    role: "BURSAR",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  FACULTY: {
    id: "b0000000-0000-0000-0000-000000000005",
    auth_user_id: "a0000000-0000-0000-0000-000000000005",
    full_name: "Dr. Alistair Finch",
    email: "faculty@kingscollege.edu",
    title: "Senior Faculty & Head of Sciences",
    status: "ACTIVE",
    role: "FACULTY",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  GUARDIAN: {
    id: "b0000000-0000-0000-0000-000000000007",
    auth_user_id: "a0000000-0000-0000-0000-000000000007",
    full_name: "Lord Sterling",
    email: "parent@kingscollege.edu",
    title: "Parent & Benefactor",
    status: "ACTIVE",
    role: "GUARDIAN",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  SCHOLAR: {
    id: "b0000000-0000-0000-0000-000000000008",
    auth_user_id: "a0000000-0000-0000-0000-000000000008",
    full_name: "Genevieve Laurent",
    email: "student@kingscollege.edu",
    title: "Scholar • Grade 11-IB",
    status: "ACTIVE",
    role: "SCHOLAR",
    school_id: "11111111-1111-1111-1111-111111111111",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

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
            DEMO_ORGANIZATION_A;

          const activeSch =
            schoolMemberships.find((s) => s.school_id === savedSchId)?.school ||
            schoolMemberships[0]?.school ||
            DEMO_SCHOOL_A1;

          const resolvedRole: UserRole =
            orgMemberships[0]?.role ||
            schoolMemberships[0]?.role ||
            (profData.role as UserRole) ||
            "STUDENT";

          setUserId(user.id);
          setProfile({
            ...profData,
            school_id: activeSch?.id || profData.school_id,
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

      // 2. Cookie-based session check
      const sessionCookie = getCookie("agragati_session");
      if (!sessionCookie) {
        setUserId(null);
        setProfile(null);
        setCurrentOrganization(null);
        setCurrentSchool(null);
        setOrganizations([]);
        setSchools([]);
        setActiveRole(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const roleCookie = (getCookie("agragati_role") as UserRole | null) || "STUDENT";
      const normalizedRole = normalizeRole(roleCookie);
      const demoProfile = DEMO_PROFILES[normalizedRole] || DEMO_PROFILES.STUDENT;

      const isOrgRole = isOrganizationScoped(normalizedRole);
      const defaultOrg = DEMO_ORGANIZATION_A;
      const defaultSch = normalizedRole === "PLATFORM_ADMIN" ? null : DEMO_SCHOOL_A1;

      setUserId(demoProfile.auth_user_id);
      setProfile({
        ...demoProfile,
        school_id: defaultSch?.id || null,
        role: normalizedRole,
      });
      setCurrentOrganization(defaultOrg);
      setCurrentSchool(defaultSch);
      setOrganizations([
        {
          id: "om-01",
          organization_id: defaultOrg.id,
          profile_id: demoProfile.id,
          role: isOrgRole ? (normalizedRole as any) : "ORGANIZATION_VIEWER",
          status: "ACTIVE",
          created_at: new Date().toISOString(),
          organization: defaultOrg,
        },
      ]);
      setSchools([
        {
          id: "sm-01",
          school_id: DEMO_SCHOOL_A1.id,
          profile_id: demoProfile.id,
          role: !isOrgRole && normalizedRole !== "PLATFORM_ADMIN" ? (normalizedRole as any) : "SCHOOL_ADMIN",
          status: "ACTIVE",
          is_primary: true,
          joined_at: new Date().toISOString(),
          school: DEMO_SCHOOL_A1,
        },
      ]);
      setActiveRole(normalizedRole);
      setIsAuthenticated(true);
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
      } else if (orgId === DEMO_ORGANIZATION_A.id) {
        setCurrentOrganization(DEMO_ORGANIZATION_A);
      } else if (orgId === DEMO_ORGANIZATION_B.id) {
        setCurrentOrganization(DEMO_ORGANIZATION_B);
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
      } else if (schoolId === DEMO_SCHOOL_A1.id) {
        setCurrentSchool(DEMO_SCHOOL_A1);
      } else if (schoolId === DEMO_SCHOOL_A2.id) {
        setCurrentSchool(DEMO_SCHOOL_A2);
      } else if (schoolId === DEMO_SCHOOL_B1.id) {
        setCurrentSchool(DEMO_SCHOOL_B1);
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
