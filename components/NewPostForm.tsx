"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createPost, type CreatePostInput } from "@/lib/api";
import { capitalize } from "@/lib/utils";
import { Button, Card } from "@/components/ui";

/**
 * 新規投稿フォーム（useMutation の基本フロー）。
 * JSONPlaceholder は投稿を永続化しない（id は常に 101 が返る）ため、
 * 送信後はその場で作成結果のプレビューを表示する。
 */
export function NewPostForm({ userId }: { userId: number }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const mutation = useMutation({
    mutationFn: (input: CreatePostInput) => createPost(input),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    mutation.mutate(
      { title: title.trim(), body: body.trim(), userId },
      {
        onSuccess: () => {
          setTitle("");
          setBody("");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="post-title"
            className="text-sm font-medium text-slate-700"
          >
            タイトル
          </label>
          <input
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="投稿のタイトル"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="post-body"
            className="text-sm font-medium text-slate-700"
          >
            本文
          </label>
          <textarea
            id="post-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="本文を入力…"
            className="w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={!title.trim() || !body.trim() || mutation.isPending}
          >
            {mutation.isPending ? "公開中…" : "投稿を公開"}
          </Button>
          {mutation.isError && (
            <span className="text-sm text-red-600">
              投稿に失敗しました。もう一度お試しください。
            </span>
          )}
        </div>
      </form>

      {mutation.isSuccess && mutation.data && (
        <Card className="border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-800">
            ✓ 投稿を作成しました（id: {mutation.data.id}）
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            ※ JSONPlaceholder はデモ用のため、実際にはサーバーへ保存されません
            （フィードには反映されません）。
          </p>
          <div className="mt-3 rounded-lg border border-emerald-200 bg-white p-4">
            <h3 className="font-semibold text-slate-900">
              {capitalize(mutation.data.title)}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {capitalize(mutation.data.body)}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
