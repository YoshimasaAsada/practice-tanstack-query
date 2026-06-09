import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import * as api from "@/lib/api";

/**
 * TanStack Query v5 の queryOptions / infiniteQueryOptions ファクトリ。
 *
 * queryKey と queryFn を1か所に同梱しておくことで、
 * 以前なら各 page.tsx / クライアントコンポーネントに直接書いていた
 * useQuery / prefetchQuery の設定を共通化できる。
 *
 * - サーバーコンポーネントでの prefetch
 * - クライアントでの useQuery / useInfiniteQuery
 * - ミューテーション後の setQueryData / invalidateQueries
 * すべてで同じ定義（＝同じキー・同じ型）を共有できる。
 */

/** ログイン中ユーザーに見立てる固定ID（"あなた" として扱う） */
export const CURRENT_USER_ID = 1;

/** フィードの1ページあたり件数 */
export const FEED_PAGE_SIZE = 10;

export interface FeedFilters {
  /** 投稿者で絞り込み */
  userId?: number;
  /** 全文検索キーワード */
  q?: string;
}

export const postQueries = {
  all: ["posts"] as const,
  feed: (filters: FeedFilters = {}) =>
    infiniteQueryOptions({
      queryKey: ["posts", "feed", filters] as const,
      queryFn: ({ pageParam }) =>
        api.getFeedPage({ page: pageParam, limit: FEED_PAGE_SIZE, ...filters }),
      initialPageParam: 1,
      // 取得件数がページサイズ未満になったら次ページなし、とみなす
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === FEED_PAGE_SIZE ? allPages.length + 1 : undefined,
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: ["posts", "detail", id] as const,
      queryFn: () => api.getPost(id),
    }),
  comments: (postId: number) =>
    queryOptions({
      queryKey: ["posts", "detail", postId, "comments"] as const,
      queryFn: () => api.getPostComments(postId),
    }),
};

export const userQueries = {
  all: ["users"] as const,
  list: () =>
    queryOptions({
      queryKey: ["users", "list"] as const,
      queryFn: api.getUsers,
      // ユーザー一覧は変化が少ないので長めにキャッシュ
      staleTime: 5 * 60 * 1000,
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: ["users", "detail", id] as const,
      queryFn: () => api.getUser(id),
    }),
  posts: (id: number) =>
    queryOptions({
      queryKey: ["users", "detail", id, "posts"] as const,
      queryFn: () => api.getUserPosts(id),
    }),
  albums: (id: number) =>
    queryOptions({
      queryKey: ["users", "detail", id, "albums"] as const,
      queryFn: () => api.getUserAlbums(id),
    }),
  todos: (id: number) =>
    queryOptions({
      queryKey: ["users", "detail", id, "todos"] as const,
      queryFn: () => api.getUserTodos(id),
    }),
};

export const albumQueries = {
  all: ["albums"] as const,
  page: (page: number) =>
    queryOptions({
      queryKey: ["albums", "page", page] as const,
      queryFn: () => api.getAlbumsPage(page),
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: ["albums", "detail", id] as const,
      queryFn: () => api.getAlbum(id),
    }),
  photos: (albumId: number) =>
    queryOptions({
      queryKey: ["albums", "detail", albumId, "photos"] as const,
      queryFn: () => api.getAlbumPhotos(albumId),
    }),
};
