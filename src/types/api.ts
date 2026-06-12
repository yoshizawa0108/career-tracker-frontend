// ─── Enums ───────────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | "APPLIED"
  | "DOCUMENT_SCREENING"
  | "INTERVIEW"
  | "FINAL_INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "ACCEPTED"
  | "WITHDRAWN";

export type InterviewType =
  | "phone_screening"
  | "technical"
  | "hr"
  | "executive"
  | "final"
  | "other";

export type InterviewResult =
  | "passed"
  | "failed"
  | "pending"
  | "cancelled";

// ─── Company ──────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  memo?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyCreate {
  name: string;
  industry?: string;
  website?: string;
  memo?: string;
}

export interface CompanyUpdate extends Partial<CompanyCreate> {}

// ─── Application ─────────────────────────────────────────────────────────────

export interface Application {
  id: string;
  company_id: string;
  company?: Company;
  position: string;
  status: ApplicationStatus;
  applied_at?: string;
  notes?: string;
  job_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationCreate {
  company_id: string;
  position: string;
  status: ApplicationStatus;
  applied_at?: string;
  notes?: string;
  job_url?: string;
}

export interface ApplicationUpdate extends Partial<ApplicationCreate> {}

// ─── Interview ────────────────────────────────────────────────────────────────

export interface Interview {
  id: string;
  application_id: string;
  application?: Application;
  interview_type: InterviewType;
  scheduled_at?: string;
  result?: InterviewResult;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewCreate {
  application_id: string;
  interview_type: InterviewType;
  scheduled_at?: string;
  result?: InterviewResult;
  notes?: string;
}

export interface InterviewUpdate extends Partial<InterviewCreate> {}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_applications: number;
  by_status: Record<ApplicationStatus, number>;
  total_companies: number;
  total_interviews: number;
  offer_count: number;
  rejection_count: number;
}