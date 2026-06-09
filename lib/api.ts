import type { Album, Comment, Photo, Post, Todo, User } from "@/lib/types";

/**
 * JSONPlaceholder のベースURL。
 * 書き込み系（POST/PATCH/DELETE）は永続化されず、成功したかのようなレスポンスを返す。
 */
export const API_BASE_URL = "https://jsonplaceholder.typicode.com";

/**
 * 共通フェッチャ。HTTPエラーは明示的に throw して、TanStack Query の error 状態へ正しく遷移させる。
 */
async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status} ${res.statusText} (${path})`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== null) {
      sp.set(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

// ---------------------------------------------------------------------------
// Posts（フィード）
// ---------------------------------------------------------------------------

export interface FeedPageParams {
  page: number;
  limit: number;
  /** 投稿者で絞り込み */
  userId?: number;
  /** 全文検索（title / body） */
  q?: string;
}

/** フィード1ページ分の投稿を取得（無限スクロール用） */
export function getFeedPage({
  page,
  limit,
  userId,
  q,
}: FeedPageParams): Promise<Post[]> {
  const query = buildQuery({
    _page: page,
    _limit: limit,
    userId,
    q: q?.trim() || undefined,
  });
  return fetchJson<Post[]>(`/posts${query}`);
}

export function getPost(id: number): Promise<Post> {
  return fetchJson<Post>(`/posts/${id}`);
}

export interface CreatePostInput {
  title: string;
  body: string;
  userId: number;
}

export function createPost(input: CreatePostInput): Promise<Post> {
  return fetchJson<Post>("/posts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export function getPostComments(postId: number): Promise<Comment[]> {
  return fetchJson<Comment[]>(`/posts/${postId}/comments`);
}

export interface CreateCommentInput {
  postId: number;
  name: string;
  email: string;
  body: string;
}

export function createComment(input: CreateCommentInput): Promise<Comment> {
  return fetchJson<Comment>("/comments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function getUsers(): Promise<User[]> {
  return fetchJson<User[]>("/users");
}

export function getUser(id: number): Promise<User> {
  return fetchJson<User>(`/users/${id}`);
}

export function getUserPosts(userId: number): Promise<Post[]> {
  return fetchJson<Post[]>(`/posts${buildQuery({ userId })}`);
}

export function getUserAlbums(userId: number): Promise<Album[]> {
  return fetchJson<Album[]>(`/albums${buildQuery({ userId })}`);
}

export function getUserTodos(userId: number): Promise<Todo[]> {
  return fetchJson<Todo[]>(`/todos${buildQuery({ userId })}`);
}

// ---------------------------------------------------------------------------
// Albums / Photos
// ---------------------------------------------------------------------------

export interface AlbumsPage {
  data: Album[];
  total: number;
  page: number;
  limit: number;
}

export async function getAlbumsPage(
  page: number,
  limit = 12,
): Promise<AlbumsPage> {
  const res = await fetch(
    `${API_BASE_URL}/albums${buildQuery({ _page: page, _limit: limit })}`,
  );
  if (!res.ok) {
    throw new Error(`API error ${res.status} ${res.statusText}`);
  }
  const total = Number(res.headers.get("x-total-count") ?? "0");
  const data = (await res.json()) as Album[];
  return { data, total, page, limit };
}

export function getAlbum(id: number): Promise<Album> {
  return fetchJson<Album>(`/albums/${id}`);
}

export function getAlbumPhotos(albumId: number): Promise<Photo[]> {
  return fetchJson<Photo[]>(`/albums/${albumId}/photos`);
}

// ---------------------------------------------------------------------------
// Todos
// ---------------------------------------------------------------------------

export function toggleTodo(id: number, completed: boolean): Promise<Todo> {
  return fetchJson<Todo>(`/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ completed }),
  });
}

export interface CreateTodoInput {
  title: string;
  userId: number;
  completed: boolean;
}

export function createTodo(input: CreateTodoInput): Promise<Todo> {
  return fetchJson<Todo>("/todos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
