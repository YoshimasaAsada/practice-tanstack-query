import type { Comment } from "@/lib/types";
import { capitalize } from "@/lib/utils";
import { Avatar } from "@/components/ui";

export function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-3">
      <Avatar name={comment.name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p className="font-medium text-slate-800">
            {capitalize(comment.name)}
          </p>
          <p className="text-xs text-slate-400">{comment.email}</p>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          {capitalize(comment.body)}
        </p>
      </div>
    </div>
  );
}
