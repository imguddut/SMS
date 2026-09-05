export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole =
  | "SUPER_ADMIN"
  | "OWNER"
  | "PRINCIPAL"
  | "SCHOOL_ADMIN"
  | "TEACHER"
  | "ACCOUNTANT"
  | "PARENT"
  | "STUDENT";

export type SchoolStatus = "PROVISIONING" | "ACTIVE" | "TRIAL" | "SUSPENDED";
export type UserStatus = "ACTIVE" | "INVITED" | "SUSPENDED";
export type StudentStatus = "ACTIVE" | "GRADUATED" | "WITHDRAWN" | "SUSPENDED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED" | "LATE";
export type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED" | "REFUNDED";
export type PaymentMethod = "BANK_TRANSFER" | "CARD" | "CASH" | "CHEQUE" | "DIRECT_DEBIT";
export type ReconciliationStatus = "UNMATCHED" | "MATCHED" | "FLAGGED" | "RECONCILED";
export type HomeworkStatus = "ASSIGNED" | "SUBMITTED" | "GRADED" | "LATE" | "RESUBMIT_REQUESTED";
export type ApprovalType = "BURSARY_WAIVER" | "LEAVE_REQUEST" | "EXCURSION_AUTHORIZATION" | "GRADEBOOK_PUBLICATION" | "STAFF_APPOINTMENT";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "ESCROW";

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          legal_name: string;
          slug: string;
          domain: string | null;
          institution_type: string;
          curriculum_framework: string;
          jurisdiction: string;
          base_currency: string;
          capacity_target: number;
          status: SchoolStatus;
          hsm_enclave_enabled: boolean;
          logo_url: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["schools"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["schools"]["Insert"]>;
      };
      users_profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          school_id: string | null;
          role: UserRole;
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          title: string | null;
          status: UserStatus;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users_profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users_profiles"]["Insert"]>;
      };
      academic_years: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["academic_years"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["academic_years"]["Insert"]>;
      };
      academic_terms: {
        Row: {
          id: string;
          academic_year_id: string;
          name: string;
          term_code: string;
          start_date: string;
          end_date: string;
          is_current: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["academic_terms"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["academic_terms"]["Insert"]>;
      };
      classes: {
        Row: {
          id: string;
          school_id: string;
          academic_year_id: string;
          name: string;
          grade_level: number;
          curriculum_code: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["classes"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["classes"]["Insert"]>;
      };
      sections: {
        Row: {
          id: string;
          class_id: string;
          name: string;
          room_number: string | null;
          max_capacity: number;
          form_tutor_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sections"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["sections"]["Insert"]>;
      };
      teachers: {
        Row: {
          id: string;
          school_id: string;
          profile_id: string;
          employee_id: string;
          department: string;
          qualification: string | null;
          title: string | null;
          joining_date: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["teachers"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["teachers"]["Insert"]>;
      };
      students: {
        Row: {
          id: string;
          school_id: string;
          profile_id: string;
          admission_number: string;
          house: string;
          date_of_birth: string;
          gender: string | null;
          blood_group: string | null;
          medical_notes: string | null;
          status: StudentStatus;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["students"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
      };
      guardians: {
        Row: {
          id: string;
          school_id: string;
          profile_id: string;
          relationship_type: string;
          occupation: string | null;
          emergency_contact: string;
          address: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["guardians"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["guardians"]["Insert"]>;
      };
      invoices: {
        Row: {
          id: string;
          school_id: string;
          invoice_number: string;
          student_id: string | null;
          guarantor_id: string | null;
          academic_term_id: string | null;
          issue_date: string;
          due_date: string;
          subtotal_amount: number;
          discount_amount: number;
          tax_amount: number;
          total_amount: number;
          balance_due: number;
          status: InvoiceStatus;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["invoices"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
      };
      notices: {
        Row: {
          id: string;
          school_id: string;
          author_id: string;
          title: string;
          content_markdown: string;
          target_audiences: Json;
          is_pinned: boolean;
          image_url: string | null;
          location_tag: string | null;
          publish_date: string;
          expiry_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notices"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["notices"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          school_id: string | null;
          actor_id: string | null;
          action: string;
          entity_table: string;
          entity_id: string;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
      };
    };
  };
}
