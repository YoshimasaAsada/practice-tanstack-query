"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { postQueries, userQueries } from "@/lib/queries";
import { capitalize } from "@/lib/utils";
import {
  Avatar,
  Card,
  ErrorState,
  SectionDivider,
  Skeleton,
  SkeletonText,
  Spinner,
} from "@/components/ui";
import { CommentItem } from "@/components/CommentItem";
import { AddCommentForm } from "@/components/AddCommentForm";

export function PostDetailView({ postId }: { postId: number }) {
  const postQuery = useQuery(postQueries.detail(postId));
  const usersQuery = useQuery(userQueries.list());
  const commentsQuery = useQuery(postQueries.comments(postId));

  if (postQuery.isPending) return <DetailSkeleton />;
  if (postQuery.isError) {
    return (
      <div className="space-y-6">
        <BackLink />
        <ErrorState
          error={postQuery.error}
          onRetry={() => postQuery.refetch()}
        />
      </div>
    );
  }

  const post = postQuery.data;
  const author = usersQuery.data?.find((u) => u.id === post.userId);
  const comments = commentsQuery.data ?? [];

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <BackLink />

      <header className="space-y-4">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">
          {capitalize(post.title)}
        </h1>
        {author ? (
          <Link
            href={`/users/${author.id}`}
            className="inline-flex items-center gap-3 rounded-lg p-1 pr-3 transition hover:bg-slate-100"
          >
            <Avatar name={author.name} size="md" />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {author.name}
              </p>
              <p className="text-xs text-slate-400">
                @{author.username} · {author.company.name}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        )}
      </header>

      <div className="prose-slate max-w-none text-[15px] leading-8 text-slate-700">
        {capitalize(post.body)}
      </div>

      <SectionDivider />

      <section className="space-y-5">
        <h2 className="text-lg font-bold text-slate-900">
          コメント
          <span className="ml-2 text-sm font-normal text-slate-400">
            {commentsQuery.isPending ? "" : comments.length}
          </span>
        </h2>

        <Card className="p-4">
          <AddCommentForm postId={postId} />
        </Card>

        {commentsQuery.isPending ? (
          <div className="flex justify-center py-6">
            <Spinner label="コメントを読み込み中…" />
          </div>
        ) : commentsQuery.isError ? (
          <ErrorState
            error={commentsQuery.error}
            onRetry={() => commentsQuery.refetch()}
          />
        ) : comments.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            まだコメントはありません。最初のコメントを投稿しましょう。
          </p>
        ) : (
          <div className="space-y-5">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </section>
    </article>
  );
}

function BackLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-indigo-600"
    >
      ← フィードへ戻る
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <BackLink />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <SkeletonText lines={6} />
    </div>
  );
}
