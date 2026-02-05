import { User, UserDTO } from '@/entities/user';

export interface AuthResponseDTO {
  access_token: string;
  profile: UserDTO;
}

export interface AuthResponse {
  accessToken: string;
  profile: User;
}
