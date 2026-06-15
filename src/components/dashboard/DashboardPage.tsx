import React from "react";
import { applicationsApi, companiesApi, interviewsApi } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import { Card, Badge, Spinner } from "../ui/Index";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  formatDate,
} from "../../lib/utils";
import type { ApplicationStatus } from "../../types/api";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: string;
}

function StatCard({ label, value, icon, accent = "bg-slate-100 text-slate-600" }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const { status: appStatus, data: applications } = useAsync(() => applicationsApi.list(), []);
  const { data: companies } = useAsync(() => companiesApi.list(), []);
  const { data: interviews } = useAsync(() => interviewsApi.list(), []);

  const byStatus = React.useMemo(() => {
    const counts: Partial<Record<ApplicationStatus, number>> = {};
    for (const app of applications ?? []) {
      counts[app.status] = (counts[app.status] ?? 0) + 1;
    }
    return counts;
  }, [applications]);

  const offerCount = (byStatus["OFFER"] ?? 0) + (byStatus["ACCEPTED"] ?? 0);
  const rejectedCount = byStatus["REJECTED"] ?? 0;

  const recentApps = [...(applications ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const upcomingInterviews = [...(interviews ?? [])]
    .filter((iv) => iv.scheduled_at && new Date(iv.scheduled_at) >= new Date())
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
    .slice(0, 5);

  if (appStatus === "loading") {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">ダッシュボード</h1>
        <p className="text-sm text-slate-500 mt-0.5">転職活動の全体像を確認します</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="応募総数"
          value={applications?.length ?? 0}
          accent="bg-blue-100 text-blue-600"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="企業数"
          value={companies?.length ?? 0}
          accent="bg-slate-100 text-slate-600"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M3 21h18M9 21V5a2 2 0 012-2h2a2 2 0 012 2v16M9 10h6" />
            </svg>
          }
        />
        <StatCard
          label="内定数"
          value={offerCount}
          accent="bg-emerald-100 text-emerald-600"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="面接予定"
          value={upcomingInterviews.length}
          accent="bg-violet-100 text-violet-600"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status breakdown */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">ステータス別</h2>
          {Object.keys(APPLICATION_STATUS_LABELS).length === 0 ? (
            <p className="text-sm text-slate-400">データがありません</p>
          ) : (
            <div className="space-y-2">
              {(Object.entries(APPLICATION_STATUS_LABELS) as [ApplicationStatus, string][]).map(
                ([status, label]) => {
                  const count = byStatus[status] ?? 0;
                  const total = applications?.length ?? 1;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  if (count === 0) return null;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <Badge className={`w-28 justify-center shrink-0 ${APPLICATION_STATUS_COLORS[status]}`}>
                        {label}
                      </Badge>
                      <div className="flex-1 rounded-full bg-slate-100 h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-400 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-slate-500 w-6 text-right">{count}</span>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </Card>

        {/* Upcoming interviews */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">直近の面接予定</h2>
          {upcomingInterviews.length === 0 ? (
            <p className="text-sm text-slate-400">面接予定はありません</p>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((iv) => (
                <div key={iv.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600 shrink-0">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {iv.company_name ?? `応募 #${iv.application_id}`}
                    </p>
                    <p className="text-xs text-slate-500">{iv.position}</p>
                  </div>
                  <p className="text-xs text-slate-400 shrink-0">{formatDate(iv.scheduled_at)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent applications */}
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">直近の応募</h2>
          {recentApps.length === 0 ? (
            <p className="text-sm text-slate-400">応募がありません</p>
          ) : (
            <div className="space-y-2">
              {recentApps.map((app) => (
                <div key={app.id} className="flex items-center gap-4 text-sm py-1">
                  <p className="font-medium text-slate-900 w-40 truncate">
                    {app.company_name}
                  </p>
                  <p className="text-slate-600 flex-1 truncate">{app.position}</p>
                  <Badge className={APPLICATION_STATUS_COLORS[app.status]}>
                    {APPLICATION_STATUS_LABELS[app.status]}
                  </Badge>
                  <p className="text-xs text-slate-400 w-24 text-right">{formatDate(app.applied_at)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}