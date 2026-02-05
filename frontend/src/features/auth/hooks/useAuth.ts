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