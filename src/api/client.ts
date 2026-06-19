import type {
  Company,
  CompanyCreate,
  CompanyUpdate,
  Application,
  ApplicationCreate,
  ApplicationUpdate,
  Interview,
  InterviewCreate,
  InterviewUpdate,
  ApplicationDashboardResponse,
} from "../types/api";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "API error");
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Companies ───────────────────────────────────────────────────────────────

export const companiesApi = {
  list: () => request<Company[]>("/companies"),
  get: (id: string) => request<Company>(`/companies/${id}`),
  create: (data: CompanyCreate) =>
    request<Company>("/companies", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: CompanyUpdate) =>
    request<Company>(`/companies/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  patch: (id: string, data: CompanyUpdate) =>
    request<Company>(`/companies/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/companies/${id}`, { method: "DELETE" }),
};

// ─── Applications ─────────────────────────────────────────────────────────────

export const applicationsApi = {
  list: () => request<Application[]>("/applications"),
  get: (id: string) => request<Application>(`/applications/${id}`),
  create: (data: ApplicationCreate) =>
    request<Application>("/applications", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: ApplicationUpdate) =>
    request<Application>(`/applications/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  patch: (id: string, data: ApplicationUpdate) =>
    request<Application>(`/applications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/applications/${id}`, { method: "DELETE" }),
};

// ─── Interviews ───────────────────────────────────────────────────────────────

export const interviewsApi = {
  list: () => request<Interview[]>("/interviews"),
  get: (id: string) => request<Interview>(`/interviews/${id}`),
  create: (data: InterviewCreate) =>
    request<Interview>("/interviews", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: InterviewUpdate) =>
    request<Interview>(`/interviews/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  patch: (id: string, data: InterviewUpdate) =>
    request<Interview>(`/interviews/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/interviews/${id}`, { method: "DELETE" }),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  applications: (params?: { keyword?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.keyword) query.set("keyword", params.keyword);
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return request<ApplicationDashboardResponse>(`/dashboard/applications${qs ? `?${qs}` : ""}`);
  },
};