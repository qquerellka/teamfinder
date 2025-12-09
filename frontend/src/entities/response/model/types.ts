export type ResponseStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "expired";

export interface Response {
  id: number;
  vacancyId: number;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
  status: ResponseStatus;
}

export interface ResponseDTO {
  id: number;
  vacancy_id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  status: ResponseStatus;
}


export interface UpdateResponse {
    status: ResponseStatus,
}

export interface UpdateResponseDTO {
    status: ResponseStatus,
}


