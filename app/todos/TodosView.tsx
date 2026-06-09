"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CURRENT_USER_ID, userQueries } from "@/lib/queries";
import type { Todo } from "@/lib/types";
import {
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  Tabs,
} from "@/components/ui";
import { TodoItem } from "@/components/TodoItem";
import { TodoComposer } from "@/components/TodoComposer";

/** フィルタの種別 */
type TodoFilter = "all" | "active" | "completed";

const FILTER_TABS = [
  { key: "all", label: "すべて" },
  { key: "active", label: "未完了" },
  { key: "completed", label: "完了" },
] as const;

export function TodosView() {
  const todosQuery = useQuery(userQueries.todos(CURRENT_USER_ID));
  const [filter, setFilter] = useState<TodoFilter>("all");

  return (
    <div className="space-y-6">
      <PageHeader
        title="あなたのTodo"
        description="完了トグルと追加は楽観的更新で即座に反映されます（デモのためサーバーには保存されません）。"
      />

      <TodoComposer userId={CURRENT_USER_ID} />

      <Tabs
        tabs={FILTER_TABS.map((t) => ({ key: t.key, label: t.label }))}
        value={filter}
        onChange={(key) => setFilter(key as TodoFilter)}
      />

      {todosQuery.isPending ? (
        <TodosSkeleton />
      ) : todosQuery.isError ? (
        <ErrorState
          error={todosQuery.error}
          onRetry={() => todosQuery.refetch()}
        />
      ) : todosQuery.data.length === 0 ? (
        <EmptyState
          title="タスクはまだありません"
          description="上のフォームから最初のタスクを追加しましょう。"
          icon="✅"
        />
      ) : (
        <TodosList todos={todosQuery.data} filter={filter} />
      )}
    </div>
  );
}

function TodosList({ todos, filter }: { todos: Todo[]; filter: TodoFilter }) {
  const total = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* 進捗 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">進捗</span>
          <span className="text-slate-500">
            {completedCount} / {total} 完了（{percent}%）
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* リスト */}
      <Card>
        {filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-400">
            該当するタスクはありません
          </p>
        ) : (
          <div className="divide-y divide-slate-100 p-1">
            {filtered.map((todo) => (
              <TodoItem key={todo.id} todo={todo} userId={CURRENT_USER_ID} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function TodosSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-2 w-full" />
      </div>
      <Card>
        <div className="divide-y divide-slate-100 p-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
