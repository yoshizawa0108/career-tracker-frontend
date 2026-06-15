import React, { useState, useCallback } from "react";
import { applicationsApi, companiesApi } from "../../api/client";
import { useAsync, useMutation } from "../../hooks/useAsync";
import type { Application, ApplicationCreate, ApplicationStatus } from "../../types/api";
import {
  Button, Card, Modal, Input, Select, Textarea,
  Badge, EmptyState, Spinner, ConfirmDialog,
} from "../ui/Index";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  formatDate,
} from "../../lib/utils";

const STATUS_OPTIONS = [
  { value: "", label: "ステータスで絞り込み" },
  ...Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const ALL_STATUS_OPTIONS = Object.entries(APPLICATION_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);

interface AppFormProps {
  initial?: Application;
  onSubmit: (data: ApplicationCreate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

function AppForm({ initial, onSubmit, onCancel, loading }: AppFormProps) {
  const { data: companies } = useAsync(() => companiesApi.list(), []);

  const companyOptions = [
    { value: "", label: "企業を選択..." },
    ...(companies ?? []).map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const [form, setForm] = useState<ApplicationCreate>({
    company_id: initial?.company_id ?? "",
    position: initial?.position ?? "",
    status: initial?.status ?? "APPLIED",
    applied_at: initial?.applied_at?.slice(0, 10) ?? "",
    note: initial?.note ?? "",
    job_url: initial?.job_url ?? "",
  });

  const set = (field: keyof ApplicationCreate) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({
    ...prev,
    [field]: e.target.value,
  }));

  return (
    <form
      onSubmit={async (e) => { e.preventDefault(); await onSubmit(form); }}
      className="flex flex-col gap-4"
    >
      <Select label="企業 *" options={companyOptions} value={String(form.company_id)} onChange={set("company_id")} required />
      <Input label="職種・ポジション *" value={form.position} onChange={set("position")} required placeholder="フロントエンドエンジニア" />
      <Select label="ステータス" options={ALL_STATUS_OPTIONS} value={form.status} onChange={set("status")} />
      <Input label="応募日" type="date" value={form.applied_at as string} onChange={set("applied_at")} />
      <Input label="求人URL" type="url" value={form.job_url} onChange={set("job_url")} placeholder="https://" />
      <Textarea label="メモ" value={form.note} onChange={set("note")} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>キャンセル</Button>
        <Button type="submit" loading={loading}>{initial ? "更新" : "登録"}</Button>
      </div>
    </form>
  );
}

export function ApplicationsPage() {
  const { status, data: applications, error, refetch } = useAsync(
    () => applicationsApi.list(), []
  );

  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Application | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "">("");
  const [search, setSearch] = useState("");

  const createMutation = useMutation(useCallback(
    (data: ApplicationCreate) => applicationsApi.create(data), []
  ));
  const updateMutation = useMutation(useCallback(
    (p: { id: string; data: ApplicationCreate }) => applicationsApi.update(p.id, p.data), []
  ));
  const deleteMutation = useMutation(useCallback(
    (id: string) => applicationsApi.delete(id), []
  ));

  const filtered = (applications ?? []).filter((a) => {
    const matchStatus = filterStatus === "" || a.status === filterStatus;
    const matchSearch =
      a.company_name.toLowerCase().includes(search.toLowerCase()) ||
      a.position.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">応募</h1>
          <p className="text-sm text-slate-500 mt-0.5">応募状況を一覧で管理します</p>
        </div>
        <Button onClick={() => { setSelected(null); setModal("create"); }}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          応募を追加
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="企業名・職種で絞り込み…"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus | "")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {status === "loading" && (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      )}
      {status === "error" && <p className="text-sm text-red-500">{error}</p>}
      {status === "success" && (
        <Card>
          {filtered.length === 0 ? (
            <EmptyState
              title="応募がありません"
              description="右上のボタンから応募を追加してください"
              icon={
                <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-5 py-3.5 font-medium text-slate-500">企業</th>
                  <th className="px-5 py-3.5 font-medium text-slate-500">職種</th>
                  <th className="px-5 py-3.5 font-medium text-slate-500">ステータス</th>
                  <th className="px-5 py-3.5 font-medium text-slate-500">応募日</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((app, i) => (
                  <tr
                    key={app.id}
                    className={`${i !== filtered.length - 1 ? "border-b border-slate-50" : ""} hover:bg-slate-50/50`}
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {app.company_name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{app.position}</td>
                    <td className="px-5 py-3.5">
                      <Badge className={APPLICATION_STATUS_COLORS[app.status]}>
                        {APPLICATION_STATUS_LABELS[app.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(app.applied_at)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        {app.job_url && (
                          <a
                            href={app.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 transition"
                          >
                            求人
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelected(app); setModal("edit"); }}
                        >
                          編集
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => setDeleteTarget(app)}
                        >
                          削除
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      <Modal open={modal === "create"} onClose={() => setModal(null)} title="応募を追加">
        <AppForm
          onCancel={() => setModal(null)}
          loading={createMutation.status === "loading"}
          onSubmit={async (data) => {
            await createMutation.mutate(data);
            setModal(null);
            refetch();
          }}
        />
      </Modal>

      <Modal open={modal === "edit"} onClose={() => setModal(null)} title="応募を編集">
        {selected && (
          <AppForm
            initial={selected}
            onCancel={() => setModal(null)}
            loading={updateMutation.status === "loading"}
            onSubmit={async (data) => {
              await updateMutation.mutate({ id: selected.id, data });
              setModal(null);
              refetch();
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="この応募を削除しますか？"
        description={`${deleteTarget?.company_name ?? ""} / ${deleteTarget?.position ?? ""}`}
        loading={deleteMutation.status === "loading"}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
          refetch();
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}