import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000, // 2 minutes - keep data fresh longer
      gcTime: 30 * 60 * 1000, // 30 minutes in cache
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});

// Prefetch common data to speed up navigation
export async function prefetchAppData() {
  const prefetchPromises = [
    queryClient.prefetchQuery({
      queryKey: ["/api/community/posts"],
      staleTime: 5 * 60 * 1000, // Community posts stay fresh for 5 minutes
    }),
    queryClient.prefetchQuery({
      queryKey: ["/api/workout-progress"],
      staleTime: 2 * 60 * 1000,
    }),
  ];
  
  // Run all prefetches in parallel, don't block on failures
  await Promise.allSettled(prefetchPromises);
}
