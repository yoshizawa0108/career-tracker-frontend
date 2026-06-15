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
  | "CASUAL"
  | "FIRST"
  | "SECOND"
  | "FINAL";

export type InterviewResult =
  | "PASSED"
  | "FAILED"
  | "PENDING"
  | "CANCELLED";

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
  company_name: string;  
  position: string;
  status: ApplicationStatus;
  applied_at?: string;
  note?: string;         
  job_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationCreate {
  company_id: string;
  position: string;
  status: ApplicationStatus;
  applied_at?: string;
  note?: string;
  job_url?: string;
}

export interface ApplicationUpdate extends Partial<ApplicationCreate> {}

// ─── Interview ────────────────────────────────────────────────────────────────

export interface Interview {
  id: string;
  application_id: string;
  company_name: string;  
  position: string;      
  interview_type: InterviewType;
  scheduled_at?: string;
  result?: InterviewResult;
  memo?: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewCreate {
  application_id: string;
  interview_type: InterviewType;
  scheduled_at?: string;
  result?: InterviewResult;
  memo?: string;
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