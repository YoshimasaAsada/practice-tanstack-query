import Link from "next/link";
import type { Album, User } from "@/lib/types";
import { albumCoverUrl, capitalize } from "@/lib/utils";
import { Card } from "@/components/ui";

export function AlbumCard({ album, author }: { album: Album; author?: User }) {
  return (
    <Link href={`/albums/${album.id}`} className="group block">
      <Card className="h-full overflow-hidden transition group-hover:border-indigo-300 group-hover:shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={albumCoverUrl(album.id, 480)}
          alt=""
          loading="lazy"
          className="aspect-[3/2] w-full bg-slate-100 object-cover"
        />
        <div className="p-4">
          <h3 className="line-clamp-2 font-semibold leading-snug text-slate-900 group-hover:text-indigo-700">
            {capitalize(album.title)}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {author ? author.name : `ユーザー #${album.userId}`}
          </p>
        </div>
      </Card>
    </Link>
  );
}
