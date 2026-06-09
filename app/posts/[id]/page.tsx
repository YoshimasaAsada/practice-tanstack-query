import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { CURRENT_USER_ID, postQueries, userQueries } from "@/lib/queries";
import { PostDetailView } from "./PostDetailView";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 16 では params は Promise なので await する
  const { id } = await params;
  const postId = Number(id);
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(postQueries.detail(postId)),
    queryClient.prefetchQuery(postQueries.comments(postId)),
    queryClient.prefetchQuery(userQueries.list()),
    queryClient.prefetchQuery(userQueries.detail(CURRENT_USER_ID)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostDetailView postId={postId} />
    </HydrationBoundary>
  );
}
