import Link from "next/link";
import type { User } from "@/lib/types";
import { Avatar, Card } from "@/components/ui";

export function UserCard({ user }: { user: User }) {
  return (
    <Link href={`/users/${user.id}`} className="group block">
      <Card className="h-full p-5 transition group-hover:border-indigo-300 group-hover:shadow-md">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900 group-hover:text-indigo-700">
              {user.name}
            </p>
            <p className="truncate text-sm text-slate-400">@{user.username}</p>
          </div>
        </div>
        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-slate-400">✉️</span>
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-slate-400">🏢</span>
            <span className="truncate">{user.company.name}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-slate-400">📍</span>
            <span className="truncate">{user.address.city}</span>
          </div>
        </dl>
      </Card>
    </Link>
  );
}
