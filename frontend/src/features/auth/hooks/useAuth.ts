import { useQuery } from "@tanstack/react-query";
import type { AuthResponse, UserResponse } from "../model/types";
import { authQueryFn } from "../api/login";

export const AUTH_QUERY_KEY = ["auth"];

export function useAuth() {
  const query = useQuery<AuthResponse>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authQueryFn,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return {
    profile: (query.data?.profile as UserResponse | null) ?? null,
    accessToken: query.data?.access_token ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetchAuth: query.refetch,
  };
}
