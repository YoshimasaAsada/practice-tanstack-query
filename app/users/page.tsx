import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { userQueries } from "@/lib/queries";
import { UsersView } from "./UsersView";

export default async function UsersPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(userQueries.list());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersView />
    </HydrationBoundary>
  );
}
