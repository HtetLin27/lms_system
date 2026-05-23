import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppWithAuth from "./AppWithAuth.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes Data is considered fresh for 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes How long unused cache stays in memory
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: true, // Refetch data when the window regains focus
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppWithAuth />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
