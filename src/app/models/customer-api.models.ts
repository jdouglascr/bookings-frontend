export interface CustomerUpsertRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CustomerResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
