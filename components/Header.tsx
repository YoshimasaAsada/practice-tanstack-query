"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CURRENT_USER_ID, userQueries } from "@/lib/queries";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "フィード" },
  { href: "/users", label: "ユーザー" },
  { href: "/albums", label: "アルバム" },
  { href: "/todos", label: "Todo" },
];

export function Header() {
  const pathname = usePathname();
  const { data: me } = useQuery(userQueries.detail(CURRENT_USER_ID));

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="text-xl">📝</span>
          <span className="text-lg tracking-tight text-slate-900">Postly</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive(item.href)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/compose"
            className="hidden rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 sm:inline-flex"
          >
            ＋ 投稿する
          </Link>
          {me && (
            <Link
              href={`/users/${CURRENT_USER_ID}`}
              className="flex items-center gap-2"
              title={`${me.name} としてログイン中`}
            >
              <Avatar name={me.name} size="sm" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
