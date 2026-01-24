import { UserDTO } from '@/entities/user';

export interface AuthResponse {
  access_token: string;
  profile: UserDTO;
}
