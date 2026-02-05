import { authQueryFn } from '../api/login';
import { useAppQuery } from '@/shared/api/useAppQuery';
import { AuthResponse } from '../model/types';

export const AUTH_QUERY_KEY = ['auth'];

export function useAuth() {

  return useAppQuery<AuthResponse>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authQueryFn,
  });

}


  // const queryClient = useQueryClient();
  // const handledUserIdRef = useRef<string | null>(null);


  // useEffect(() => {
  //   const id = query.data?.profile?.id;
  //   if (!id) return;

  //   const newId = String(id);

  //   if (handledUserIdRef.current === newId) return;
  //   handledUserIdRef.current = newId;

  //   const prevId = localStorage.getItem('tf:last_profile_id');

  //   if (prevId && prevId !== newId) {
  //     queryClient.cancelQueries({
  //       predicate: q => q.queryKey[0] !== AUTH_QUERY_KEY[0],
  //     });

  //     queryClient.removeQueries({
  //       predicate: q => q.queryKey[0] !== AUTH_QUERY_KEY[0],
  //     });
  //   }

  //   localStorage.setItem('tf:last_profile_id', newId);
  // }, [query.data?.profile?.id, queryClient]);

  // return {
  //   profile: (query.data?.profile as UserDTO | null) ?? null,
  //   accessToken: query.data?.access_token ?? null,
  //   isLoading: query.isLoading,
  //   isError: query.isError,
  //   error: query.error,
  //   refetchAuth: query.refetch,
  // };