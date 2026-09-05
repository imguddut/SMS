export type UserRole =
  | "SUPER_ADMIN"
  | "OWNER"
  | "PRINCIPAL"
  | "SCHOOL_ADMIN"
  | "TEACHER"
  | "ACCOUNTANT"
  | "PARENT"
  | "STUDENT";

export interface UserProfile {
  id: string;
  auth_user_id: string;
  school_id: string | null;
  role: UserRole;
  full_name: string;
  email: string;
  demo_password?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  title?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "INVITED";
  metadata?: {
    demo_password?: string;
    login_hint?: string;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

export interface SchoolTenant {
  id: string;
  legal_name: string;
  slug: string;
  domain?: string | null;
  currency: string;
  status: "ACTIVE" | "TRIAL" | "PROVISIONING" | "SUSPENDED";
  logo_url?: string | null;
  created_at: string;
}

export interface AuthSession {
  user: UserProfile;
  school: SchoolTenant | null;
}
