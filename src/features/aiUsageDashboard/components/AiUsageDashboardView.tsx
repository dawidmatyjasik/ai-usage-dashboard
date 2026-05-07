import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AiUsageDashboardContent } from "./AiUsageDashboardContent";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30_000,
    },
  },
});

export const AiUsageDashboardView = () => (
  <QueryClientProvider client={queryClient}>
    <AiUsageDashboardContent />
  </QueryClientProvider>
);
