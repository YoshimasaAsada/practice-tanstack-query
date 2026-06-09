# TanStack Query メモ

このメモは、このプロジェクトで使っている TanStack Query の主な部品を読み返すためのもの。

## `QueryClient`

`QueryClient` は、TanStack Query のキャッシュ、再取得、mutation 後の更新を管理する本体。

このプロジェクトでは `lib/get-query-client.ts` で作っている。

```ts
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}
```

主な用途は2つ。

- ブラウザ側: `QueryClientProvider` に渡して、配下の `useQuery` / `useMutation` が同じキャッシュを共有できるようにする
- サーバー側: `prefetchQuery` で先に取得したデータを一時的なキャッシュに入れ、`dehydrate` でクライアントへ渡す

通常のコンポーネント内で毎回 `new QueryClient()` するものではない。

## `makeQueryClient` の設定

```ts
staleTime: 60 * 1000
```

取得したデータを60秒間 fresh 扱いにする設定。
画面遷移や再マウント直後に、同じ query をすぐ再取得しないようにするため。

```ts
dehydrate: {
  shouldDehydrateQuery: (query) =>
    defaultShouldDehydrateQuery(query) ||
    query.state.status === "pending",
}
```

SSR / Streaming Hydration 用の設定。
通常 `dehydrate` される query に加えて、まだ `pending` の query もクライアントへ引き継ぐ。

## `HydrationBoundary`

`HydrationBoundary` は、サーバー側で作った TanStack Query のキャッシュを、配下のクライアントコンポーネントに復元するための境界。

例: `app/albums/[id]/page.tsx`

```tsx
const queryClient = getQueryClient();

await Promise.all([
  queryClient.prefetchQuery(albumQueries.detail(albumId)),
  queryClient.prefetchQuery(albumQueries.photos(albumId)),
  queryClient.prefetchQuery(userQueries.list()),
]);

return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <AlbumDetailView albumId={albumId} />
  </HydrationBoundary>
);
```

流れは次の通り。

- サーバーコンポーネントで `prefetchQuery` する
- `dehydrate(queryClient)` でキャッシュ状態をクライアントへ渡せる形にする
- `HydrationBoundary` 配下のクライアントコンポーネントが、そのキャッシュを使って `useQuery` できる

これにより、初回表示時にクライアント側で空の状態から取得し直すのではなく、サーバーで取得済みのデータをすぐ表示できる。

## `queryOptions`

`queryOptions` は、`queryKey` と `queryFn` をまとめた query 設定オブジェクトを作るためのヘルパー。

例: `lib/queries.ts`

```ts
todos: (id: number) =>
  queryOptions({
    queryKey: ["users", "detail", id, "todos"] as const,
    queryFn: () => api.getUserTodos(id),
  }),
```

これは、分解すると次のような関数。

```ts
todos: function (id: number) {
  return queryOptions({
    queryKey: ["users", "detail", id, "todos"] as const,
    queryFn: () => api.getUserTodos(id),
  });
}
```

`userQueries.todos(1)` を呼ぶと、ざっくり次のような query 設定が返る。

```ts
{
  queryKey: ["users", "detail", 1, "todos"],
  queryFn: () => api.getUserTodos(1),
}
```

`queryOptions` は `queryOptions` というプロパティを作るわけではない。
そのため、アクセスは次の形になる。

```ts
userQueries.todos(userId).queryKey;
```

次の形ではない。

```ts
userQueries.todos(userId).queryOptions.queryKey;
```

## なぜ `queryOptions` にまとめるのか

`queryOptions` にまとめない場合、各ページや各コンポーネントで次のように直接書くことになる。

```tsx
useQuery({
  queryKey: ["posts", "detail", postId],
  queryFn: () => api.getPost(postId),
});
```

サーバー側でも同じように書く必要がある。

```tsx
await queryClient.prefetchQuery({
  queryKey: ["posts", "detail", postId],
  queryFn: () => api.getPost(postId),
});
```

これだと `queryKey` の書き間違いや、サーバー側とクライアント側のキー不一致が起きやすい。
Hydration では `queryKey` が一致していないと、サーバーで prefetch したキャッシュをクライアント側の `useQuery` が使えない。

そのため、このプロジェクトでは `lib/queries.ts` に query 定義を集約している。

```ts
postQueries.detail(postId)
userQueries.todos(userId)
albumQueries.photos(albumId)
```

これをサーバー側の `prefetchQuery` と、クライアント側の `useQuery` の両方で使い回す。

## `todosKey`

`components/TodoItem.tsx` では次のように書いている。

```ts
const todosKey = userQueries.todos(userId).queryKey;
```

`userId` が `1` の場合、`todosKey` には次の値が入る。

```ts
["users", "detail", 1, "todos"]
```

これは React Query 内で「ユーザーID 1 の Todo 一覧キャッシュ」を探すためのキー。

このキーを使って、現在のキャッシュを取得したり、書き換えたりする。

```ts
queryClient.getQueryData(todosKey);
queryClient.setQueryData(todosKey, nextTodos);
```

この場面ではデータ取得をするわけではなく、既存キャッシュを操作したいだけなので、`queryFn` は使わない。
そのため `userQueries.todos(userId)` の返り値から `.queryKey` だけ取り出している。

## mutation の処理をコンポーネントに書いている理由

`components/TodoItem.tsx` の mutation は、Todo のチェックを押したときに画面へ即時反映するための楽観的更新。

`onMutate` は「更新が終わった直後」ではなく、`mutationFn` が実行される直前に発火する。
そのため、サーバーの更新結果を待つ前にフロント側のキャッシュを仮更新できる。

実行順は次のイメージ。

```txt
mutation.mutate()
→ onMutate()
→ mutationFn()
→ 成功したら onSuccess / 失敗したら onError
```

```ts
const mutation = useMutation({
  mutationFn: () => toggleTodo(todo.id, !todo.completed),
  onMutate: async () => {
    await queryClient.cancelQueries({ queryKey: todosKey });
    const previous = queryClient.getQueryData(todosKey);
    queryClient.setQueryData(todosKey, (old) =>
      old?.map((t) =>
        t.id === todo.id ? { ...t, completed: !t.completed } : t,
      ),
    );
    return { previous };
  },
  onError: (_error, _vars, context) => {
    if (context) {
      queryClient.setQueryData(todosKey, context.previous);
    }
  },
});
```

ここでは `queryKey` 自体は `userQueries.todos(userId).queryKey` から取っている。
つまり完全にベタ書きしているわけではない。

一方で、`onMutate` / `onError` / `onSuccess` のような mutation の処理は、画面ごとの UI 挙動に近い。
どのキャッシュをどう楽観的に更新するか、失敗時にどう戻すかは、そのコンポーネント固有になりやすい。

そのため、このプロジェクトでは query 定義は `lib/queries.ts` に集約し、再利用が少ない mutation の楽観的更新処理はコンポーネント側に書いている。

もし同じ mutation を複数画面で使うようになったら、`useToggleTodoMutation` のような custom hook に切り出す判断になる。
