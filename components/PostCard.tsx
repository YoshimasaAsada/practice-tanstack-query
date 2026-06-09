import Link from "next/link";
import type { Post, User } from "@/lib/types";
import { capitalize, excerpt } from "@/lib/utils";
import { Avatar, Card } from "@/components/ui";

/**
 * フィードや一覧で使う投稿カード。
 * author を渡すと著者のアバター・名前を表示する（フィードでは users 一覧から引いて渡す）。
 */
export function PostCard({ post, author }: { post: Post; author?: User }) {
  return (
    <Link href={`/posts/${post.id}`} className="group block">
      <Card className="h-full p-5 transition group-hover:border-indigo-300 group-hover:shadow-md">
        <div className="flex h-full flex-col">
          <h3 className="font-semibold leading-snug text-slate-900 group-hover:text-indigo-700">
            {capitalize(post.title)}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
            {excerpt(capitalize(post.body), 110)}
          </p>
          <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
            {author ? (
              <>
                <Avatar name={author.name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {author.name}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    @{author.username}
                  </p>
                </div>
              </>
            ) : (
              <span className="text-xs text-slate-400">
                ユーザー #{post.userId}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
