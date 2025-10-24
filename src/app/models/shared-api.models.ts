export interface ErrorResponse {
  status: number;
  message: string;
  errors: object;
  timestamp: string;
}

export interface MessageResponse {
  message: string;
}
