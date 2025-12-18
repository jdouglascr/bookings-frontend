import { APIRequestContext } from '@playwright/test';

interface LoginResponse {
  accessToken: string;
}

interface BookingResponse {
  id: number;
}

export class BookingCleanupHelper {
  private token: string | null = null;

  constructor(private request: APIRequestContext) {}

  async authenticate(apiUrl: string, email: string, password: string): Promise<void> {
    const res = await this.request.post(`${apiUrl}/api/public/auth/login`, {
      data: { email, password },
    });

    if (!res.ok()) {
      throw new Error(`Authentication failed with status ${res.status()}`);
    }

    const data: LoginResponse = await res.json();
    this.token = data.accessToken;
  }

  async deleteLastBooking(apiUrl: string): Promise<void> {
    if (!this.token) {
      throw new Error('Must authenticate before deleting bookings');
    }

    const res = await this.request.get(`${apiUrl}/api/bookings`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (!res.ok()) {
      throw new Error(`Failed to fetch bookings with status ${res.status()}`);
    }

    const bookings: BookingResponse[] = await res.json();

    if (bookings.length === 0) {
      throw new Error('No bookings found to delete');
    }

    const lastBookingId = bookings.reduce((max, b) => (b.id > max.id ? b : max)).id;

    const delRes = await this.request.delete(`${apiUrl}/api/bookings/${lastBookingId}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (!delRes.ok()) {
      throw new Error(`Failed to delete booking with status ${delRes.status()}`);
    }
  }
}
