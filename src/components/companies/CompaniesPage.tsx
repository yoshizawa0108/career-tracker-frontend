import React, { useState, useCallback } from "react";
import { companiesApi } from "../../api/client";
import { useAsync, useMutation } from "../../hooks/useAsync";
import type { Company, CompanyCreate } from "../../types/api";
import {
  Button,
  Card,
  Modal,
  Input,
  Textarea,
  Badge,
  EmptyState,
  Spinner,
  ConfirmDialog,
} from "../ui/Index";
import { formatDate } from "../../lib/utils";

// ─── Form ─────────────────────────────────────────────────────────────────────

interface CompanyFormProps {
  initial?: Company;
  onSubmit: (data: CompanyCreate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

function CompanyForm({ initial, onSubmit, onCancel, loading }: CompanyFormProps) {
  const [form, setForm] = useState<CompanyCreate>({
    name: initial?.name ?? "",
    industry: initial?.industry ?? "",
    website: initial?.website ?? "",
    memo: initial?.memo ?? "",
  });

  const set = (field: keyof CompanyCreate) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit(form);
      }}
      className="flex flex-col gap-4"
    >
      <Input label="企業名 *" value={form.name} onChange={set("name")} required />
      <Input label="業界" value={form.industry} onChange={set("industry")} placeholder="IT・Web" />
      <Input label="Webサイト" value={form.website} onChange={set("website")} placeholder="https://" type="url" />
      <Textarea label="メモ" value={form.memo} onChange={set("memo")} placeholder="自由記述" />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>キャンセル</Button>
        <Button type="submit" loading={loading}>
          {initial ? "更新" : "登録"}
        </Button>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CompaniesPage() {
  const { status, data: companies, error, refetch } = useAsync(
    () => companiesApi.list(),
    []
  );

  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [search, setSearch] = useState("");

  const createMutation = useMutation(useCallback(
    (data: CompanyCreate) => companiesApi.create(data),
    []
  ));
  const updateMutation = useMutation(useCallback(
    (payload: { id: string; data: CompanyCreate }) =>
      companiesApi.update(payload.id, payload.data),
    []
  ));
  const deleteMutation = useMutation(useCallback(
    (id: string) => companiesApi.delete(id),
    []
  ));

  const filtered = (companies ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">企業</h1>
          <p className="text-sm text-slate-500 mt-0.5">応募先企業を管理します</p>
        </div>
        <Button onClick={() => { setSelected(null); setModal("create"); }}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          企業を追加
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="企業名・業界で絞り込み…"
          className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      {/* Content */}
      {status === "loading" && (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6" /></div>
      )}
      {status === "error" && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {status === "success" && (
        <Card>
          {filtered.length === 0 ? (
            <EmptyState
              title="企業がありません"
              description="右上のボタンから企業を追加してください"
              icon={
                <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                  <path d="M3 21h18M9 21V5a2 2 0 012-2h2a2 2 0 012 2v16M9 10h6" />
                </svg>
              }
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-5 py-3.5 font-medium text-slate-500">企業名</th>
                  <th className="px-5 py-3.5 font-medium text-slate-500">業界</th>
                  <th className="px-5 py-3.5 font-medium text-slate-500">Webサイト</th>
                  <th className="px-5 py-3.5 font-medium text-slate-500">登録日</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((company, i) => (
                  <tr
                    key={company.id}
                    className={`${i !== filtered.length - 1 ? "border-b border-slate-50" : ""} hover:bg-slate-50/50`}
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900">{company.name}</td>
                    <td className="px-5 py-3.5">
                      {company.industry ? (
                        <Badge className="bg-slate-100 text-slate-600">{company.industry}</Badge>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate max-w-[180px] inline-block"
                        >
                          {company.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(company.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelected(company); setModal("edit"); }}
                        >
                          編集
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => setDeleteTarget(company)}
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

      {/* Create Modal */}
      <Modal
        open={modal === "create"}
        onClose={() => setModal(null)}
        title="企業を追加"
      >
        <CompanyForm
          onCancel={() => setModal(null)}
          loading={createMutation.status === "loading"}
          onSubmit={async (data) => {
            await createMutation.mutate(data);
            setModal(null);
            refetch();
          }}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={modal === "edit"}
        onClose={() => setModal(null)}
        title="企業を編集"
      >
        {selected && (
          <CompanyForm
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

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={`「${deleteTarget?.name}」を削除しますか？`}
        description="この操作は取り消せません。関連する応募データも削除される可能性があります。"
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