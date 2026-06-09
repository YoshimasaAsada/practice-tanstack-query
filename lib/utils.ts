// 表示まわりの小さなユーティリティ群

/** クラス名を結合（falsy を除去） */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** 本文を指定文字数で抜粋（末尾に…） */
export function excerpt(text: string, max = 120): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return normalized.slice(0, max).trimEnd() + "…";
}

/** 文字列の先頭を大文字化（jsonplaceholder の本文は全部小文字なので見栄え用） */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** 名前からイニシャル（最大2文字） */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// アバター背景に使う落ち着いた配色パレット
const AVATAR_COLORS = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-pink-500",
];

/** 文字列から決定的に色クラスを選ぶ（同じ名前は常に同じ色） */
export function colorFromString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * 写真URL。
 * JSONPlaceholder の photos が指す via.placeholder.com は現在は停止しているため、
 * 写真IDをシードに picsum.photos の決定的画像へ差し替えて表示する。
 */
export function photoUrl(photoId: number, size = 400): string {
  return `https://picsum.photos/seed/postly-photo-${photoId}/${size}/${size}`;
}

/** アルバムのカバー画像（アルバムIDをシードに） */
export function albumCoverUrl(albumId: number, size = 400): string {
  return `https://picsum.photos/seed/postly-album-${albumId}/${size}/${Math.round(
    size * 0.66,
  )}`;
}
