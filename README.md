# 📝 Postly

> **JSONPlaceholder を使った「実プロダクト風」ブログ/SNS コンテンツアプリのデモ**
> Next.js 16（App Router）× TanStack Query v5 × TypeScript × Tailwind v4 で、
> 検索・無限スクロール・SSR プリフェッチ・楽観的更新といった
> 実アプリで使う TanStack Query の組み込み方を「動くアプリ」として実装したものです。

これは解説ページ集ではなく、**実際に操作できる1つのアプリケーション**です。
（TanStack Query の概念を1テーマずつ学ぶ教材は、別プロジェクト `tanstack-query-catchup` の方にあります。）

---

## ✨ 主な機能

| 画面 | パス | 内容 |
| --- | --- | --- |
| フィード | `/` | 投稿一覧。**全文検索**・**投稿者フィルタ**・**無限スクロール**（`useInfiniteQuery`） |
| 投稿詳細 | `/posts/[id]` | 本文・著者カード・コメント一覧＋**コメント投稿**（楽観的更新） |
| ユーザー一覧 | `/users` | 全ユーザーのディレクトリ（クライアント検索つき） |
| プロフィール | `/users/[id]` | ユーザー情報＋タブ（**投稿 / アルバム / Todo**） |
| アルバム | `/albums` | フォトアルバムのギャラリー（**ページネーション**） |
| アルバム詳細 | `/albums/[id]` | 写真グリッド |
| Todo | `/todos` | タスク管理。完了トグル・追加を**楽観的更新**で即時反映 |
| 投稿する | `/compose` | 新規投稿フォーム（`useMutation`） |

ヘッダー右上のアバターは「ログイン中ユーザー」（`CURRENT_USER_ID = 1`、Leanne Graham）に見立てています。
コメント・新規投稿・Todo はこのユーザーとして行われます。

---

## 🧰 技術スタック

| 種類 | 採用 |
| --- | --- |
| フレームワーク | **Next.js 16**（App Router / Turbopack） |
| 言語 | TypeScript（strict） |
| データ取得・キャッシュ | **TanStack Query v5**（`queryOptions` / `infiniteQueryOptions`） |
| スタイル | Tailwind CSS v4 |
| API | JSONPlaceholder |
| 画像 | Lorem Picsum（`via.placeholder.com` が停止済みのため代替） |

---

## 🚀 起動方法

```bash
pnpm install
pnpm dev          # → http://localhost:3000

pnpm build        # 本番ビルド（型チェック込み）
pnpm typecheck    # 型チェックのみ
```

---

## 🏗️ アーキテクチャ

### `QueryClient` を用意するタイミング

`QueryClient` は、TanStack Query のキャッシュ・再取得・mutation 後の更新を管理する単位です。
記述するのは主に、アプリ全体を `QueryClientProvider` で包むとき、またはサーバー側で `prefetchQuery` して
`dehydrate` するための一時的なキャッシュを作るときです。

- ブラウザ側: Provider 配下の `useQuery` / `useMutation` が同じキャッシュを共有するため、基本はシングルトンを使い回す
- サーバー側: リクエスト間でキャッシュを混ぜないため、リクエストごとに新しい `QueryClient` を作る
- 通常のコンポーネント内で毎回 `new QueryClient()` する用途ではない

### サーバープリフェッチ → Hydration（App Router の定石）

各ルートの `page.tsx`（サーバーコンポーネント）で初期データをサーバー側で取得し、
クライアントへ受け渡します。これにより**初回表示からデータが埋まった状態**になります。

```tsx
// app/posts/[id]/page.tsx（抜粋）
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;            // ← Next.js 16 では params は Promise
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(postQueries.detail(Number(id))),
    queryClient.prefetchQuery(postQueries.comments(Number(id))),
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostDetailView postId={Number(id)} />   {/* クライアント側は同じ queryOptions で購読 */}
    </HydrationBoundary>
  );
}
```

### `queryOptions` ファクトリ（`lib/queries.ts`）

`queryKey` と `queryFn` を1か所に同梱した `queryOptions` / `infiniteQueryOptions` を定義し、
**サーバーの prefetch・クライアントの useQuery・ミューテーションのキャッシュ操作**すべてで共有します。
これによりキーの不一致（＝ Hydration ミスやキャッシュ分裂）が起きません。

```ts
export const postQueries = {
  feed:    (filters) => infiniteQueryOptions({ queryKey: ["posts","feed",filters], queryFn: ..., getNextPageParam: ... }),
  detail:  (id)      => queryOptions({ queryKey: ["posts","detail",id], queryFn: () => api.getPost(id) }),
  comments:(postId)  => queryOptions({ queryKey: ["posts","detail",postId,"comments"], queryFn: () => api.getPostComments(postId) }),
};
```

### 楽観的更新（フェイクバックエンドへの最適化）

コメント投稿・Todo トグル/追加は、サーバー応答を待たずに `setQueryData` で**キャッシュを即時更新**します。
JSONPlaceholder は書き込みを永続化しないため、本アプリでは**あえて `invalidateQueries` を行わず**、
楽観的更新の結果をそのままセッション中保持します（再フェッチで変更が巻き戻らないように）。
失敗時は `onError` でスナップショットへロールバックします。

```
onMutate  → cancelQueries → getQueryData(スナップショット) → setQueryData(楽観更新)
onError   → setQueryData(スナップショットで巻き戻し)
onSuccess → 一時IDをサーバー応答で置き換え（invalidate しない）
```

---

## 🗂️ ディレクトリ構成

```
postly/
├── app/
│   ├── layout.tsx                 # ヘッダー・フッター・Providers
│   ├── providers.tsx              # QueryClientProvider + Devtools
│   ├── page.tsx / HomeFeed.tsx    # フィード（infinite + 検索 + フィルタ）
│   ├── posts/[id]/                # 投稿詳細 + コメント
│   ├── users/ , users/[id]/       # 一覧 / プロフィール（タブ）
│   ├── albums/ , albums/[id]/     # ギャラリー / 写真
│   ├── todos/                     # Todo 管理
│   └── compose/                   # 新規投稿
├── lib/
│   ├── api.ts                     # JSONPlaceholder への型付きフェッチ
│   ├── queries.ts                 # queryOptions ファクトリ（中核）
│   ├── get-query-client.ts        # サーバー/ブラウザで分岐する QueryClient
│   ├── types.ts                   # ドメイン型
│   └── utils.ts                   # 抜粋・イニシャル・画像URLなどの補助
└── components/
    ├── Header.tsx                 # ナビ + 現在ユーザー
    ├── ui.tsx                     # Avatar / Card / Button / Skeleton ...
    ├── PostCard / UserCard / AlbumCard / PhotoThumb / CommentItem
    └── AddCommentForm / TodoItem / TodoComposer / NewPostForm   # ミューテーション
```

---

## ⚠️ JSONPlaceholder についての注意

- 書き込み（コメント・投稿・Todo）は**サーバーに保存されません**。本アプリは楽観的更新でクライアント側のキャッシュに反映し、操作感を再現しています。
- 写真の元URL（`via.placeholder.com`）は現在停止しているため、`lib/utils.ts` の `photoUrl` / `albumCoverUrl` で **Lorem Picsum** の画像に差し替えています。

---

## 🔗 参考

- [TanStack Query 公式](https://tanstack.com/query/latest)
- [Advanced Server Rendering（App Router）](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [Next.js Docs](https://nextjs.org/docs)
- [JSONPlaceholder](https://jsonplaceholder.typicode.com)
