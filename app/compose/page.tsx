import type { Metadata } from "next";
import { CURRENT_USER_ID } from "@/lib/queries";
import { PageHeader } from "@/components/ui";
import { NewPostForm } from "@/components/NewPostForm";

export const metadata: Metadata = {
  title: "投稿する",
};

export default function ComposePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="投稿する"
        description="新しい投稿を作成します（useMutation のデモ）。"
      />
      <NewPostForm userId={CURRENT_USER_ID} />
    </div>
  );
}
