/**
 * AGRAGATI PLATFORM — Multi-Tenant Role Hierarchy & Definitions
 *
 * Scopes:
 * 1. PLATFORM LEVEL:
 *    - PLATFORM_ADMIN (Super Admin / National Fleet HQ)
 *
 * 2. ORGANIZATION LEVEL (Primary Tenant Scope):
 *    - ORGANIZATION_OWNER (Trust Chairman / Society President / Founder)
 *    - ORGANIZATION_ADMIN (CEO / Executive Director / Group Operations)
 *    - ORGANIZATION_FINANCE (Bursar General / Trust Financial Controller)
 *    - ORGANIZATION_VIEWER (Auditor / Trustee / Advisory Board)
 *
 * 3. SCHOOL LEVEL (Operational Child Entity Scope):
 *    - PRINCIPAL (Head of School / Academic & Administrative Authority)
 *    - SCHOOL_ADMIN (Registrar / Operations Lead)
 *    - TEACHER (PGT / TGT / PRT Faculty Member)
 *    - ACCOUNTANT (School Accounts Officer / Cashier)
 *
 * 4. RELATIONSHIP / SELF LEVEL:
 *    - PARENT (Ward / Child Relationship Scoped)
 *    - STUDENT (Self Scoped Scholar)
 */

export type PlatformRole = "PLATFORM_ADMIN";

export type OrganizationRole =
  | "ORGANIZATION_OWNER"
  | "ORGANIZATION_ADMIN"
  | "ORGANIZATION_FINANCE"
  | "ORGANIZATION_VIEWER";

export type SchoolRole =
  | "PRINCIPAL"
  | "SCHOOL_ADMIN"
  | "TEACHER"
  | "ACCOUNTANT";

export type IndividualRole = "PARENT" | "STUDENT";

export type CanonicalUserRole =
  | PlatformRole
  | OrganizationRole
  | SchoolRole
  | IndividualRole;

// Legacy aliases for seamless backward compatibility
export type LegacyUserRole =
  | "SUPER_ADMIN"
  | "TRUST_CHAIRMAN"
  | "CEO"
  | "OWNER"
  | "BURSAR"
  | "FACULTY"
  | "GUARDIAN"
  | "SCHOLAR";

export type UserRole = CanonicalUserRole | LegacyUserRole;

/**
 * Normalizes any role token (canonical or legacy) to a CanonicalUserRole.
 */
export function normalizeRole(role: string | null | undefined): CanonicalUserRole {
  if (!role) return "STUDENT";
  const upper = role.toUpperCase().trim();
  switch (upper) {
    // Platform
    case "PLATFORM_ADMIN":
    case "SUPER_ADMIN":
      return "PLATFORM_ADMIN";

    // Organization
    case "ORGANIZATION_OWNER":
    case "TRUST_CHAIRMAN":
    case "OWNER":
      return "ORGANIZATION_OWNER";
    case "ORGANIZATION_ADMIN":
    case "CEO":
      return "ORGANIZATION_ADMIN";
    case "ORGANIZATION_FINANCE":
      return "ORGANIZATION_FINANCE";
    case "ORGANIZATION_VIEWER":
      return "ORGANIZATION_VIEWER";

    // School
    case "PRINCIPAL":
      return "PRINCIPAL";
    case "SCHOOL_ADMIN":
      return "SCHOOL_ADMIN";
    case "TEACHER":
    case "FACULTY":
      return "TEACHER";
    case "ACCOUNTANT":
    case "BURSAR":
    case "FINANCE":
      return "ACCOUNTANT";

    // Relationship / Self
    case "PARENT":
    case "GUARDIAN":
      return "PARENT";
    case "STUDENT":
    case "SCHOLAR":
      return "STUDENT";

    default:
      return "STUDENT";
  }
}

/**
 * Checks whether the role operates at the platform/national level.
 */
export function isPlatformScoped(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return norm === "PLATFORM_ADMIN";
}

/**
 * Checks whether the role operates at the organization/trust level (multi-school).
 */
export function isOrganizationScoped(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return (
    norm === "ORGANIZATION_OWNER" ||
    norm === "ORGANIZATION_ADMIN" ||
    norm === "ORGANIZATION_FINANCE" ||
    norm === "ORGANIZATION_VIEWER"
  );
}

/**
 * Legacy alias for isOrganizationScoped.
 */
export function isTrustScoped(role: UserRole): boolean {
  return isOrganizationScoped(role);
}

/**
 * Checks whether the role requires a mandatory school_id context.
 */
export function isSchoolScoped(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return (
    norm === "PRINCIPAL" ||
    norm === "SCHOOL_ADMIN" ||
    norm === "TEACHER" ||
    norm === "ACCOUNTANT" ||
    norm === "PARENT" ||
    norm === "STUDENT"
  );
}

/**
 * Checks whether the role access is scoped to specific relationships (children, self, assigned classes).
 */
export function isRelationshipScoped(role: UserRole): boolean {
  const norm = normalizeRole(role);
  return norm === "PARENT" || norm === "STUDENT" || norm === "TEACHER";
}

/**
 * Resolves the default landing route for any role.
 */
export function getRoleHomeRoute(role: UserRole): string {
  const norm = normalizeRole(role);
  switch (norm) {
    case "PLATFORM_ADMIN":
      return "/platform-admin/overview";
    case "ORGANIZATION_OWNER":
    case "ORGANIZATION_ADMIN":
    case "ORGANIZATION_FINANCE":
    case "ORGANIZATION_VIEWER":
      return "/organization";
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
