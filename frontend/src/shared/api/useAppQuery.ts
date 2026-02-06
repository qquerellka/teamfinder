import {
  useSuspenseQuery,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  type QueryKey,
} from '@tanstack/react-query';

type AppQueryOptions<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>;

export function useAppQuery<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: AppQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseSuspenseQueryResult<TData, TError> {
  return useSuspenseQuery({
    gcTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });
}
