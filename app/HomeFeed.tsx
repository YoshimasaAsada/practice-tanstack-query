"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { User } from "@/lib/types";
import { postQueries, userQueries, type FeedFilters } from "@/lib/queries";
import { PostCard } from "@/components/PostCard";
import {
  Card,
  EmptyState,
  ErrorState,
  LoadMore,
  PageHeader,
  SearchInput,
  Skeleton,
  Spinner,
} from "@/components/ui";

export function HomeFeed() {
  const [queryText, setQueryText] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [userId, setUserId] = useState<number | "">("");

  // 入力のたびにフェッチしないよう、検索語は 300ms デバウンス
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(queryText), 300);
    return () => clearTimeout(timer);
  }, [queryText]);

  // フィルタは空の項目を省いて作る → 未指定時は {} となり、
  // サーバーで先読みした feed({}) のキャッシュとキーが一致する。
  const filters = useMemo<FeedFilters>(() => {
    const f: FeedFilters = {};
    if (userId !== "") f.userId = userId;
    if (debouncedQ.trim()) f.q = debouncedQ.trim();
    return f;
  }, [userId, debouncedQ]);

  const feed = useInfiniteQuery(postQueries.feed(filters));
  const usersQuery = useQuery(userQueries.list());

  const userMap = useMemo(() => {
    const map = new Map<number, User>();
    for (const u of usersQuery.data ?? []) map.set(u.id, u);
    return map;
  }, [usersQuery.data]);

  const posts = feed.data?.pages.flat() ?? [];
  const isFiltering =
    feed.isFetching && !feed.isFetchingNextPage && !feed.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="フィード"
        description="JSONPlaceholder の投稿をブログ風に閲覧。検索・投稿者での絞り込み・無限スクロールに対応。"
      />

      {/* 検索＆フィルタ */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="タイトル・本文を検索…"
          className="flex-1"
        />
        <select
          value={userId}
          onChange={(e) =>
            setUserId(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">すべての投稿者</option>
          {(usersQuery.data ?? []).map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {isFiltering && (
        <div className="flex justify-center">
          <Spinner label="検索中…" />
        </div>
      )}

      {/* 本体 */}
      {feed.isPending ? (
        <FeedSkeleton />
      ) : feed.isError ? (
        <ErrorState error={feed.error} onRetry={() => feed.refetch()} />
      ) : posts.length === 0 ? (
        <EmptyState
          title="投稿が見つかりませんでした"
          description="検索条件を変えてもう一度お試しください。"
          icon="🔍"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                author={userMap.get(post.userId)}
              />
            ))}
          </div>
          <LoadMore
            hasNextPage={!!feed.hasNextPage}
            isFetchingNextPage={feed.isFetchingNextPage}
            onClick={() => feed.fetchNextPage()}
          />
        </>
      )}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="space-y-3 p-5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </Card>
      ))}
    </div>
  );
}
