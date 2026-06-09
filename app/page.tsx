import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { postQueries, userQueries } from "@/lib/queries";
import { HomeFeed } from "./HomeFeed";

export default async function HomePage() {
  const queryClient = getQueryClient();

  // 初期フィード（フィルタなし）と著者表示用のユーザー一覧をサーバーで先読み。
  // prefetch の取得結果は queryClient のキャッシュに保存され、下の dehydrate でクライアントへ渡される。
  await Promise.all([
    queryClient.prefetchInfiniteQuery(postQueries.feed({})),
    queryClient.prefetchQuery(userQueries.list()),
  ]);

  return (
    // サーバーで先読みした Query キャッシュを HomeFeed 側の useInfiniteQuery / useQuery に復元する
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeFeed />
    </HydrationBoundary>
  );
}
