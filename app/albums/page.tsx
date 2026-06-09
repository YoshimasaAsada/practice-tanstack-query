import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { albumQueries, userQueries } from "@/lib/queries";
import { AlbumsView } from "./AlbumsView";

export default async function AlbumsPage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(albumQueries.page(1)),
    queryClient.prefetchQuery(userQueries.list()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AlbumsView />
    </HydrationBoundary>
  );
}
