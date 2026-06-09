import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { CURRENT_USER_ID, userQueries } from "@/lib/queries";
import { TodosView } from "./TodosView";

export default async function TodosPage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(userQueries.todos(CURRENT_USER_ID)),
    queryClient.prefetchQuery(userQueries.detail(CURRENT_USER_ID)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TodosView />
    </HydrationBoundary>
  );
}
