"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createComment, type CreateCommentInput } from "@/lib/api";
import type { Comment } from "@/lib/types";
import { CURRENT_USER_ID, postQueries, userQueries } from "@/lib/queries";
import { Avatar, Button } from "@/components/ui";

/**
 * コメント投稿フォーム（楽観的更新つき）。
 *
 * JSONPlaceholder はコメントを永続化しないため、サーバー再取得で消えないよう
 * invalidate はせず、楽観的に追加したコメントを成功レスポンスで置き換えてキャッシュに残す。
 */
export function AddCommentForm({ postId }: { postId: number }) {
  const queryClient = useQueryClient();
  const commentsKey = postQueries.comments(postId).queryKey;

  // 「自分」のプロフィールを著者情報として使う
  const { data: me } = useQuery(userQueries.detail(CURRENT_USER_ID));
  const authorName = me?.name ?? "あなた";
  const authorEmail = me?.email ?? "you@postly.dev";

  const [body, setBody] = useState("");

  const mutation = useMutation({
    mutationFn: (input: CreateCommentInput) => createComment(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: commentsKey });
      const previous = queryClient.getQueryData(commentsKey);
      // 負のIDで一時コメントを作成（実IDと衝突しない）
      const tempId = -Date.now();
      const optimistic: Comment = {
        id: tempId,
        postId,
        name: input.name,
        email: input.email,
        body: input.body,
      };
      queryClient.setQueryData(commentsKey, (old) =>
        old ? [...old, optimistic] : [optimistic],
      );
      return { previous, tempId };
    },
    onError: (_error, _input, context) => {
      if (context) {
        queryClient.setQueryData(commentsKey, context.previous);
      }
    },
    onSuccess: (created, _input, context) => {
      // 一時コメントをサーバー応答（id付き）で置き換える
      queryClient.setQueryData(commentsKey, (old) =>
        old?.map((c) => (c.id === context.tempId ? created : c)),
      );
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    mutation.mutate(
      { postId, name: authorName, email: authorEmail, body: trimmed },
      { onSuccess: () => setBody("") },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Avatar name={authorName} size="sm" />
      <div className="flex-1 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="コメントを書く…"
          className="w-full resize-none rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <div className="flex items-center justify-between">
          {mutation.isError ? (
            <span className="text-xs text-red-600">
              送信に失敗しました。もう一度お試しください。
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              {authorName} として投稿
            </span>
          )}
          <Button type="submit" size="sm" disabled={!body.trim()}>
            コメントする
          </Button>
        </div>
      </div>
    </form>
  );
}
