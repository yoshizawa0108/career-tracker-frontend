import React, { useState, useCallback } from "react";
import { interviewsApi, applicationsApi } from "../../api/client";
import { useAsync, useMutation } from "../../hooks/useAsync";
import type { Interview, InterviewCreate, InterviewType } from "../../types/api";
import {
  Button, Card, Modal, Select, Textarea,
  Badge, EmptyState, Spinner, ConfirmDialog,
} from "../ui/Index";
import {
  INTERVIEW_TYPE_LABELS,
  formatDateTime,
  toLocalDateTimeInput,
  toUtcIso,
} from "../../lib/utils";

const TYPE_OPTIONS = Object.entries(INTERVIEW_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));

function InterviewForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: Interview;
  onSubmit: (data: InterviewCreate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}) {
  const { data: apps } = useAsync(() => applicationsApi.list(), []);

  const appOptions = [
    { value: "", label: "応募を選択..." },
    ...(apps ?? []).map((a) => ({
      value: String(a.id),
      label: `${a.company_name} / ${a.position}`,
    })),
  ];

  const [form, setForm] = useState<InterviewCreate>({
    application_id: initial?.application_id ?? "",
    interview_type: initial?.interview_type ?? "CASUAL",
    scheduled_at: toLocalDateTimeInput(initial?.scheduled_at),
    memo: initial?.memo ?? "",
  });

  const set = (field: keyof InterviewCreate) => (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>
  ) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value || undefined,
    }));

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({
          ...form,
          scheduled_at: toUtcIso(form.scheduled_at as string | undefined),
        });
      }}
      className="flex flex-col gap-4"
    >
      <Select
        label="応募 *"
        options={appOptions}
        value={String(form.application_id)}
        onChange={set("application_id")}
        required
      />
      <Select
        label="面接種別 *"
        options={TYPE_OPTIONS}
        value={form.interview_type}
        onChange={set("interview_type")}
        required
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">面接日時</label>
        <input
          type="datetime-local"
          value={(form.scheduled_at as string | undefined) ?? ""}
          onChange={set("scheduled_at")}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />
      </div>
      <Textarea label="メモ" value={form.memo ?? ""} onChange={set("memo")} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>キャンセル</Button>
        <Button type="submit" loading={loading}>{initial ? "更新" : "登録"}</Button>
      </div>
    </form>
  );
}

export function InterviewsPage() {
  const { status, data: interviews, error, refetch } = useAsync(
    () => interviewsApi.list(), []
  );

  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Interview | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Interview | null>(null);
  const [filterType, setFilterType] = useState<InterviewType | "">("");

  const createMutation = useMutation(useCallback(
    (data: InterviewCreate) => interviewsApi.create(data), []
  ));
  const updateMutation = useMutation(useCallback(
    (p: { id: string; data: InterviewCreate }) => interviewsApi.update(p.id, p.data), []
  ));
  const deleteMutation = useMutation(useCallback(
    (id: string) => interviewsApi.delete(id), []
  ));

  const filtered = (interviews ?? []).filter(
    (i) => filterType === "" || i.interview_type === filterType
  );

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">面接</h1>
          <p className="text-sm text-slate-500 mt-0.5">面接のスケジュールを記録します</p>
        </div>
        <Button onClick={() => { setSelected(null); setModal("create"); }}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          面接を追加
        </Button>
      </div>

      <div className="mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as InterviewType | "")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        >
          <option value="">すべての種別</option>
          {Object.entries(INTERVIEW_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
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
              title="面接がありません"
              description="右上のボタンから面接を追加してください"
              icon={
                <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-5 py-3.5 font-medium text-slate-500">企業 / 職種</th>
                  <th className="px-5 py-3.5 font-medium text-slate-500">種別</th>
                  <th className="px-5 py-3.5 font-medium text-slate-500">日時</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((iv, i) => (
                  <tr
                    key={iv.id}
                    className={`${i !== filtered.length - 1 ? "border-b border-slate-50" : ""} hover:bg-slate-50/50`}
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">
                        {iv.company_name ?? `応募 #${iv.application_id}`}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">{iv.position}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {INTERVIEW_TYPE_LABELS[iv.interview_type]}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDateTime(iv.scheduled_at)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelected(iv); setModal("edit"); }}
                        >
                          編集
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => setDeleteTarget(iv)}
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

      <Modal open={modal === "create"} onClose={() => setModal(null)} title="面接を追加">
        <InterviewForm
          onCancel={() => setModal(null)}
          loading={createMutation.status === "loading"}
          onSubmit={async (data) => {
            await createMutation.mutate(data);
            setModal(null);
            refetch();
          }}
        />
      </Modal>

      <Modal open={modal === "edit"} onClose={() => setModal(null)} title="面接を編集">
        {selected && (
          <InterviewForm
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
        title="この面接記録を削除しますか？"
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