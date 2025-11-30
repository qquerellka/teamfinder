import { UserDTO } from "@/entities/user/model/types";

export interface AuthResponse {
  access_token: string;
  profile: UserDTO;

}
