import type { ApplicationStatus, InterviewType } from "../types/api";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "応募",
  DOCUMENT_SCREENING: "書類選考",
  INTERVIEW: "面接",
  FINAL_INTERVIEW: "最終面接",
  OFFER: "内定",
  REJECTED: "不合格",
  ACCEPTED: "承諾",
  WITHDRAWN: "辞退",
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPLIED: "bg-blue-100 text-blue-700",
  DOCUMENT_SCREENING: "bg-indigo-100 text-indigo-700",
  INTERVIEW: "bg-violet-100 text-violet-700",
  FINAL_INTERVIEW: "bg-pink-100 text-pink-700",
  OFFER: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  ACCEPTED: "bg-green-100 text-green-700",
  WITHDRAWN: "bg-gray-100 text-gray-500",
};

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  CASUAL: "カジュアル面談",
  FIRST: "一次面接",
  SECOND: "二次面接",
  FINAL: "最終面接",
};

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// UTC ISO文字列 → datetime-local input用のローカル時刻文字列 (YYYY-MM-DDTHH:mm)
export function toLocalDateTimeInput(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

// datetime-local inputのローカル時刻文字列 → UTC ISO文字列
export function toUtcIso(localDateTime?: string): string | undefined {
  if (!localDateTime) return undefined;
  return new Date(localDateTime).toISOString();
}