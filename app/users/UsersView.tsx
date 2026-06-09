"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries";
import {
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  SearchInput,
  Skeleton,
  SkeletonText,
} from "@/components/ui";
import { UserCard } from "@/components/UserCard";

export function UsersView() {
  const usersQuery = useQuery(userQueries.list());
  // 名前/ユーザー名のクライアント側インクリメンタル検索キーワード
  const [keyword, setKeyword] = useState("");

  // 検索フィルタリング（大文字小文字無視で name か username に部分一致）
  const filtered = useMemo(() => {
    const users = usersQuery.data ?? [];
    const q = keyword.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
    );
  }, [usersQuery.data, keyword]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ユーザー"
        description="JSONPlaceholder の全ユーザー。クリックでプロフィールへ。"
      />

      <SearchInput
        placeholder="名前 / ユーザー名で検索…"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        aria-label="ユーザーを検索"
      />

      {usersQuery.isPending ? (
        // 読み込み中: グリッドに Card+Skeleton を6枚
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="mt-4">
                <SkeletonText lines={3} />
              </div>
            </Card>
          ))}
        </div>
      ) : usersQuery.isError ? (
        <ErrorState
          error={usersQuery.error}
          onRetry={() => usersQuery.refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="該当するユーザーがいません" icon="🔍" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <UserCard key={u.id} user={u} />
          ))}
        </div>
      )}
    </div>
  );
}
