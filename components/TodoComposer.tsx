"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTodo, type CreateTodoInput } from "@/lib/api";
import type { Todo } from "@/lib/types";
import { userQueries } from "@/lib/queries";
import { Button } from "@/components/ui";

/**
 * Todo 追加フォーム（楽観的に先頭へ追加）。
 * 永続化されないため invalidate はせず、成功レスポンスで一時IDを置き換える。
 */
export function TodoComposer({ userId }: { userId: number }) {
  const queryClient = useQueryClient();
  const todosKey = userQueries.todos(userId).queryKey;
  const [title, setTitle] = useState("");

  const mutation = useMutation({
    mutationFn: (input: CreateTodoInput) => createTodo(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: todosKey });
      const previous = queryClient.getQueryData(todosKey);
      const tempId = -Date.now();
      const optimistic: Todo = {
        id: tempId,
        userId: input.userId,
        title: input.title,
        completed: input.completed,
      };
      queryClient.setQueryData(todosKey, (old) =>
        old ? [optimistic, ...old] : [optimistic],
      );
      return { previous, tempId };
    },
    onError: (_error, _input, context) => {
      if (context) {
        queryClient.setQueryData(todosKey, context.previous);
      }
    },
    onSuccess: (created, _input, context) => {
      queryClient.setQueryData(todosKey, (old) =>
        old?.map((t) => (t.id === context.tempId ? created : t)),
      );
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    mutation.mutate(
      { title: trimmed, userId, completed: false },
      { onSuccess: () => setTitle("") },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="新しいタスクを追加…"
        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
      <Button type="submit" disabled={!title.trim()}>
        追加
      </Button>
    </form>
  );
}
