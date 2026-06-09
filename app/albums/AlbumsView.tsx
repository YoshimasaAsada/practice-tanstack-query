"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { User } from "@/lib/types";
import { albumQueries, userQueries } from "@/lib/queries";
import { cn } from "@/lib/utils";
import {
  Card,
  ErrorState,
  PageHeader,
  Pagination,
  Skeleton,
  SkeletonText,
} from "@/components/ui";
import { AlbumCard } from "@/components/AlbumCard";

export function AlbumsView() {
  const [page, setPage] = useState(1);

  // ページ遷移時も前ページの内容を保持し、チラつきを抑える
  const albumsQuery = useQuery({
    ...albumQueries.page(page),
    placeholderData: keepPreviousData,
  });
  const usersQuery = useQuery(userQueries.list());

  // 所有者名を引くための userId -> User マップ
  const ownerMap = useMemo(() => {
    const map = new Map<number, User>();
    for (const user of usersQuery.data ?? []) {
      map.set(user.id, user);
    }
    return map;
  }, [usersQuery.data]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="アルバム"
        description="ユーザーが作成したフォトアルバム。画像は Lorem Picsum で代替表示。"
      />

      {albumsQuery.isPending ? (
        <AlbumsGridSkeleton />
      ) : albumsQuery.isError ? (
        <ErrorState
          error={albumsQuery.error}
          onRetry={() => albumsQuery.refetch()}
        />
      ) : (
        <>
          <div
            className={cn(
              "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
              // 前ページの内容を表示している間は薄く見せる
              albumsQuery.isPlaceholderData && "opacity-60",
            )}
          >
            {albumsQuery.data.data.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                author={ownerMap.get(album.userId)}
              />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={Math.max(
              1,
              Math.ceil(albumsQuery.data.total / albumsQuery.data.limit),
            )}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}

function AlbumsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-[3/2] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <SkeletonText lines={2} />
          </div>
        </Card>
      ))}
    </div>
  );
}
