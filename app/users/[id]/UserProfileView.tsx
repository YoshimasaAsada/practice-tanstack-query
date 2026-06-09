"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries";
import {
  Avatar,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
  SkeletonText,
  Spinner,
  Stat,
  Tabs,
} from "@/components/ui";
import { PostCard } from "@/components/PostCard";
import { AlbumCard } from "@/components/AlbumCard";
import { TodoItem } from "@/components/TodoItem";

type TabKey = "posts" | "albums" | "todos";

const TABS = [
  { key: "posts", label: "投稿" },
  { key: "albums", label: "アルバム" },
  { key: "todos", label: "Todo" },
] as const;

export function UserProfileView({ userId }: { userId: number }) {
  const [tab, setTab] = useState<TabKey>("posts");

  const userQuery = useQuery(userQueries.detail(userId));
  const postsQuery = useQuery(userQueries.posts(userId));
  const albumsQuery = useQuery(userQueries.albums(userId));
  const todosQuery = useQuery(userQueries.todos(userId));

  if (userQuery.isPending) {
    return (
      <div className="space-y-6">
        <BackLink />
        <HeaderSkeleton />
      </div>
    );
  }
  if (userQuery.isError) {
    return (
      <div className="space-y-6">
        <BackLink />
        <ErrorState
          error={userQuery.error}
          onRetry={() => userQuery.refetch()}
        />
      </div>
    );
  }

  const user = userQuery.data;

  // 統計値。データ未取得時は "…" を表示する。
  const postsCount = postsQuery.data ? String(postsQuery.data.length) : "…";
  const albumsCount = albumsQuery.data ? String(albumsQuery.data.length) : "…";
  const todosValue = todosQuery.data
    ? `${todosQuery.data.filter((t) => t.completed).length}/${todosQuery.data.length}`
    : "…";

  return (
    <div className="space-y-8">
      <BackLink />

      {/* プロフィールヘッダ */}
      <header className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">
              {user.name}
            </h1>
            <p className="truncate text-sm text-slate-400">@{user.username}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* 連絡先 */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-900">連絡先</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <ContactRow icon="✉️" label="メール">
                <a
                  href={`mailto:${user.email}`}
                  className="truncate text-indigo-600 hover:underline"
                >
                  {user.email}
                </a>
              </ContactRow>
              <ContactRow icon="📞" label="電話">
                <span className="truncate text-slate-600">{user.phone}</span>
              </ContactRow>
              <ContactRow icon="🌐" label="ウェブ">
                <a
                  href={`https://${user.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-indigo-600 hover:underline"
                >
                  {user.website}
                </a>
              </ContactRow>
            </dl>
          </Card>

          {/* 会社・住所 */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-900">
              会社・住所
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <ContactRow icon="🏢" label="会社">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-slate-700">
                    {user.company.name}
                  </span>
                  <span className="block truncate text-xs text-slate-400">
                    {user.company.catchPhrase}
                  </span>
                </span>
              </ContactRow>
              <ContactRow icon="📍" label="住所">
                <span className="truncate text-slate-600">
                  {user.address.city}, {user.address.street}
                </span>
              </ContactRow>
            </dl>
          </Card>
        </div>

        {/* 統計 */}
        <div className="grid grid-cols-3 gap-4">
          <Stat label="投稿" value={postsCount} />
          <Stat label="アルバム" value={albumsCount} />
          <Stat label="Todo（完了/総数）" value={todosValue} />
        </div>
      </header>

      {/* タブ */}
      <Tabs tabs={TABS} value={tab} onChange={(key) => setTab(key as TabKey)} />

      {tab === "posts" && (
        <PostsTab
          query={postsQuery}
          render={(posts) => (
            <div className="grid gap-5 sm:grid-cols-2">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} author={user} />
              ))}
            </div>
          )}
          emptyTitle="投稿はまだありません"
          emptyDescription={`${user.name} さんはまだ投稿していません。`}
          loadingLabel="投稿を読み込み中…"
          isEmpty={(posts) => posts.length === 0}
        />
      )}

      {tab === "albums" && (
        <PostsTab
          query={albumsQuery}
          render={(albums) => (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((a) => (
                <AlbumCard key={a.id} album={a} author={user} />
              ))}
            </div>
          )}
          emptyTitle="アルバムはまだありません"
          emptyDescription={`${user.name} さんはまだアルバムを作成していません。`}
          loadingLabel="アルバムを読み込み中…"
          isEmpty={(albums) => albums.length === 0}
          emptyIcon="🖼️"
        />
      )}

      {tab === "todos" && (
        <PostsTab
          query={todosQuery}
          render={(todos) => (
            <Card className="divide-y divide-slate-100 p-2">
              {todos.map((t) => (
                <TodoItem key={t.id} todo={t} userId={userId} />
              ))}
            </Card>
          )}
          emptyTitle="Todo はまだありません"
          emptyDescription={`${user.name} さんの Todo はまだありません。`}
          loadingLabel="Todo を読み込み中…"
          isEmpty={(todos) => todos.length === 0}
          emptyIcon="✅"
        />
      )}
    </div>
  );
}

/**
 * タブ内のデータについてローディング・エラー・空・表示を共通処理する小コンポーネント。
 * 型引数で各タブのリソース配列型を受け取る。
 */
function PostsTab<T>({
  query,
  render,
  emptyTitle,
  emptyDescription,
  loadingLabel,
  isEmpty,
  emptyIcon,
}: {
  query: {
    isPending: boolean;
    isError: boolean;
    error: unknown;
    data: T[] | undefined;
    refetch: () => unknown;
  };
  render: (items: T[]) => React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  loadingLabel: string;
  isEmpty: (items: T[]) => boolean;
  emptyIcon?: React.ReactNode;
}) {
  if (query.isPending) {
    return (
      <div className="flex justify-center py-10">
        <Spinner label={loadingLabel} />
      </div>
    );
  }
  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  const items = query.data ?? [];
  if (isEmpty(items)) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
      />
    );
  }

  return <>{render(items)}</>;
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="select-none text-slate-400" aria-hidden>
        {icon}
      </span>
      <span className="sr-only">{label}</span>
      <span className="flex min-w-0 flex-1 flex-col">{children}</span>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/users"
      className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-indigo-600"
    >
      ← ユーザー一覧へ
    </Link>
  );
}

function HeaderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <SkeletonText lines={3} />
        </Card>
        <Card className="p-5">
          <SkeletonText lines={3} />
        </Card>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
