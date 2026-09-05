import {
  UserRole,
  CanonicalUserRole,
  OrganizationRole,
  SchoolRole,
  normalizeRole,
  getRoleHomeRoute,
  isOrganizationScoped,
  isSchoolScoped,
  isPlatformScoped,
  isRelationshipScoped,
} from "./roles";

export type {
  UserRole,
  CanonicalUserRole,
  OrganizationRole,
  SchoolRole,
};

export {
  normalizeRole,
  getRoleHomeRoute,
  isOrganizationScoped,
  isSchoolScoped,
  isPlatformScoped,
  isRelationshipScoped,
};

/**
 * Global User Profile (Person Entity).
 * Represents an individual human across all organizations and schools.
 * Notice: MUST NOT contain hardcoded school_id or role!
 */
export interface UserProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  title?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "INVITED" | "ARCHIVED";
  created_at: string;
  updated_at: string;
  // Backward compatibility convenience accessors
  school_id?: string | null;
  role?: UserRole;
  metadata?: {
    demo_password?: string;
    login_hint?: string;
    [key: string]: unknown;
  };
}

/**
 * Organization Tenant Entity (Primary Tenant).
 */
export interface OrganizationTenant {
  id: string;
  platform_id: string;
  name: string;
  slug: string;
  legal_name?: string | null;
  organization_type:
    | "TRUST"
    | "SOCIETY"
    | "FOUNDATION"
    | "EDUCATION_GROUP"
    | "SCHOOL_GROUP"
    | "PRIVATE_ORGANIZATION"
    | "OTHER";
  registration_number?: string | null;
  email?: string | null;
  phone?: string | null;
  logo_url?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
}

/**
 * Organization Membership Entity.
 */
export interface OrganizationMembership {
  id: string;
  organization_id: string;
  profile_id: string;
  role: OrganizationRole;
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
  created_at: string;
  organization?: OrganizationTenant;
}

/**
 * School Tenant Entity (Organization's Child Entity).
 */
export interface SchoolTenant {
  id: string;
  organization_id: string;
  legal_name: string;
  name?: string;
  slug: string;
  school_code?: string | null;
  domain?: string | null;
  currency?: string;
  base_currency?: string;
  status: "ACTIVE" | "TRIAL" | "PROVISIONING" | "SUSPENDED" | "ARCHIVED";
  logo_url?: string | null;
  city?: string | null;
  created_at: string;
}

/**
 * School Membership Entity.
 */
export interface SchoolMembership {
  id: string;
  school_id: string;
  profile_id: string;
  role: SchoolRole;
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
  is_primary: boolean;
  joined_at: string;
  school?: SchoolTenant;
}

/**
 * Unified Multi-Tenant Auth Session.
 */
export interface AuthSession {
  user: UserProfile;
  currentOrganization: OrganizationTenant | null;
  currentSchool: SchoolTenant | null;
  organizationMemberships: OrganizationMembership[];
  schoolMemberships: SchoolMembership[];
  activeRole: UserRole;
  // Backward compatibility alias
  school: SchoolTenant | null;
}
