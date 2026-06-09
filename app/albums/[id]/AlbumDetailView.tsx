"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { albumQueries, userQueries } from "@/lib/queries";
import { capitalize } from "@/lib/utils";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { PhotoThumb } from "@/components/PhotoThumb";

export function AlbumDetailView({ albumId }: { albumId: number }) {
  const albumQuery = useQuery(albumQueries.detail(albumId));
  const usersQuery = useQuery(userQueries.list());
  const photosQuery = useQuery(albumQueries.photos(albumId));

  if (albumQuery.isPending) return <DetailSkeleton />;
  if (albumQuery.isError) {
    return (
      <div className="space-y-6">
        <BackLink />
        <ErrorState
          error={albumQuery.error}
          onRetry={() => albumQuery.refetch()}
        />
      </div>
    );
  }

  const album = albumQuery.data;
  // 所有者名は users 一覧から引く。見つからなければフォールバック表示。
  const owner = usersQuery.data?.find((u) => u.id === album.userId);
  const ownerName = owner ? owner.name : `ユーザー #${album.userId}`;

  return (
    <div className="space-y-8">
      <BackLink />

      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {capitalize(album.title)}
        </h1>
        <p className="text-sm text-slate-500">{ownerName}</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          写真
          <span className="ml-2 text-sm font-normal text-slate-400">
            {photosQuery.isPending ? "" : (photosQuery.data?.length ?? 0)}
          </span>
        </h2>

        {photosQuery.isPending ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        ) : photosQuery.isError ? (
          <ErrorState
            error={photosQuery.error}
            onRetry={() => photosQuery.refetch()}
          />
        ) : photosQuery.data.length === 0 ? (
          <EmptyState
            title="写真がありません"
            description="このアルバムにはまだ写真が登録されていません。"
            icon="🖼️"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photosQuery.data.map((photo) => (
              <PhotoThumb key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/albums"
      className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-indigo-600"
    >
      ← アルバム一覧へ
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-8">
      <BackLink />
      <div className="space-y-2">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
