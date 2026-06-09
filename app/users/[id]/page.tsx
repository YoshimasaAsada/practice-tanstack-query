import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { userQueries } from "@/lib/queries";
import { UserProfileView } from "./UserProfileView";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 16 では params は Promise なので await する
  const { id } = await params;
  const userId = Number(id);
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(userQueries.detail(userId)),
    queryClient.prefetchQuery(userQueries.posts(userId)),
    queryClient.prefetchQuery(userQueries.albums(userId)),
    queryClient.prefetchQuery(userQueries.todos(userId)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserProfileView userId={userId} />
    </HydrationBoundary>
  );
}
