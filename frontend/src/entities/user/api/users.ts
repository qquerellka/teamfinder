import { apiClient } from '@/shared/api/client';
import { User, UserDTO, UserEdit } from '../model/types';
import { userEditToDTO, userToCamelCase } from '../lib/dto';

export async function getAuthUser(): Promise<User> {
  const { data } = await apiClient.get<UserDTO>('/users/me');
  return userToCamelCase(data);
}

export async function getUserById(id: number): Promise<User> {
  const { data } = await apiClient.get<UserDTO>(`/users/${id}`);
  return userToCamelCase(data);
}

export async function editUserMainInfo(payload: UserEdit): Promise<User> {
  const { data } = await apiClient.patch<UserDTO>('/users/me', userEditToDTO(payload));
  return userToCamelCase(data);
}
