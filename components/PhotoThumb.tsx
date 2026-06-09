import type { Photo } from "@/lib/types";
import { capitalize, photoUrl } from "@/lib/utils";

/**
 * 写真サムネイル。
 * JSONPlaceholder の画像ホスト(via.placeholder.com)は停止しているため、
 * 写真IDをシードに picsum.photos の画像を表示している（photoUrl ユーティリティ）。
 * クリックで大きいサイズを別タブで開く。
 */
export function PhotoThumb({ photo }: { photo: Photo }) {
  return (
    <a
      href={photoUrl(photo.id, 800)}
      target="_blank"
      rel="noreferrer"
      className="group relative block overflow-hidden rounded-lg bg-slate-100"
      title={capitalize(photo.title)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl(photo.id, 300)}
        alt={photo.title}
        loading="lazy"
        className="aspect-square w-full object-cover transition duration-200 group-hover:scale-105"
      />
      <span className="absolute inset-x-0 bottom-0 line-clamp-1 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-[11px] text-white opacity-0 transition group-hover:opacity-100">
        {capitalize(photo.title)}
      </span>
    </a>
  );
}
