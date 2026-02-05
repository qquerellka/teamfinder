import { userToCamelCase } from "@/entities/user/lib/dto";
import { AuthResponse, AuthResponseDTO } from "../model/types";


export const authResponseToCamelCase =(r: AuthResponseDTO): AuthResponse => {
    return {
        accessToken: r.access_token,
        profile: userToCamelCase(r.profile)
    }
}