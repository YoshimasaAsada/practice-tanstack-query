import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: {
    default: "Postly",
    template: "%s · Postly",
  },
  description:
    "JSONPlaceholder を使ったブログ/SNS風コンテンツアプリ（Next.js 16 × TanStack Query v5 のデモ）",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>
          <Header />
          <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-xs text-slate-400">
              Postly — デモアプリ · データ提供:{" "}
              <a
                href="https://jsonplaceholder.typicode.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-600"
              >
                JSONPlaceholder
              </a>{" "}
              · 画像:{" "}
              <a
                href="https://picsum.photos"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-600"
              >
                Lorem Picsum
              </a>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
