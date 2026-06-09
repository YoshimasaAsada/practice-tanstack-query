import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { albumQueries, userQueries } from "@/lib/queries";
import { AlbumDetailView } from "./AlbumDetailView";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 16 では params は Promise なので await する
  const { id } = await params;
  const albumId = Number(id);
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(albumQueries.detail(albumId)),
    queryClient.prefetchQuery(albumQueries.photos(albumId)),
    queryClient.prefetchQuery(userQueries.list()),
  ]);

  return (
    // サーバー側で prefetch した Query キャッシュを、配下のクライアントコンポーネントの useQuery に引き継ぐ
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AlbumDetailView albumId={albumId} />
    </HydrationBoundary>
  );
}
