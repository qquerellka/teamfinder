import { Response, ResponseDTO, UpdateResponse, UpdateResponseDTO } from "../model/types";

export function responsesToCamelCase(responses: ResponseDTO[]): Response[] {
  return responses.map((r) => ({
    id: r.id,
    vacancyId: r.vacancy_id,
    status: r.status,
    user: {
      id: r.user.id,
      username: r.user.username,
      firstName: r.user.first_name,
      lastName: r.user.last_name,
    },
  }));
}

export function updateResponseToDTO(r: UpdateResponse): UpdateResponseDTO {
    return {
        status: r.status,
    }
}
