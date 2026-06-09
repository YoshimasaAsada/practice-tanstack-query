"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleTodo } from "@/lib/api";
import type { Todo } from "@/lib/types";
import { userQueries } from "@/lib/queries";
import { cn } from "@/lib/utils";

/**
 * Todo 1行。チェックボックスのトグルを楽観的更新で即時反映する。
 * （フェイクバックエンドのため invalidate はせず、楽観更新の結果をそのまま残す）
 */
export function TodoItem({ todo, userId }: { todo: Todo; userId: number }) {
  const queryClient = useQueryClient();
  // userQueries.todos(userId) は queryOptions の返り値。
  // queryOptions には queryKey と queryFn がセットで定義されているが、
  // ここでは取得はしないので queryFn は使わず、操作対象のキャッシュを示す queryKey だけ取り出す。
  // queryOptionsはオブジェクトを返すので、todosKey は配列の queryKey だけ抜き取る。
  const todosKey = userQueries.todos(userId).queryKey;

  const mutation = useMutation({
    mutationFn: () => toggleTodo(todo.id, !todo.completed),
    onMutate: async () => {
      // TodoItem 固有の楽観的更新。再利用する query 定義は lib/queries.ts に寄せ、
      // この画面でどう即時反映・ロールバックするかはコンポーネント側に書く。
      // onMutate は mutationFn の直前に発火するので、サーバー更新を待たずに先にキャッシュを仮更新できる。
      await queryClient.cancelQueries({ queryKey: todosKey });
      const previous = queryClient.getQueryData(todosKey);
      queryClient.setQueryData(todosKey, (old) =>
        old?.map((t) =>
          t.id === todo.id ? { ...t, completed: !t.completed } : t,
        ),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context) {
        queryClient.setQueryData(todosKey, context.previous);
      }
    },
  });

  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-slate-50">
      <input
        type="checkbox"
        checked={todo.completed}
        disabled={mutation.isPending}
        onChange={() => mutation.mutate()}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span
        className={cn(
          "flex-1 text-sm",
          todo.completed ? "text-slate-400 line-through" : "text-slate-700",
        )}>
        {todo.title}
      </span>
      {mutation.isPending && (
        <span className="text-xs text-indigo-500">更新中…</span>
      )}
    </label>
  );
}
