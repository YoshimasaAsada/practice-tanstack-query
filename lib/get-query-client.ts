import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
} from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 取得後 60 秒間は fresh 扱いにして、画面遷移や再マウント直後の不要な再取得を抑える
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // SSR / Streaming Hydration 用。
        // 通常の dehydrate 対象に加えて、まだ pending の query もクライアントへ引き継ぐ
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * App Router 公式パターン。
 * - サーバー: リクエストごとに新しい QueryClient（リクエスト間でキャッシュを共有しない）
 * - ブラウザ: シングルトンを使い回す
 */
export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
