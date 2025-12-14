import { Page } from '@playwright/test';
import { AvailabilityResponse, DaySchedule, SelectedTimeSlot } from '../types/availability.types';

export class WebsitePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Este método permite seleccionar un servicio de la tarjeta con servicios
   * @param text - Nombre del servicio
   */
  async selectService(serviceName: string) {
    await this.page.getByRole('heading', { name: `${serviceName}` }).click();
  }

  /**
   * Este método permite seleccionar un recurso de flujo reserva
   * @param text - Nombre del recurso
   */
  async selectResource(resourceName: string) {
    await this.page.getByRole('button', { name: `${resourceName}` }).click();
  }

  /**
   * Este método permite presionar botón "Siguiente"
   */
  async clickNextButton() {
    await this.page.getByRole('button', { name: 'Siguiente' }).click();
  }

  /**
   * Este método permite presionar botón "Atrás"
   */
  async clickBackButton() {
    await this.page.getByRole('button', { name: 'Atrás' }).click();
  }

  /**
   * Este método permite presionar botón "Reservar"
   */
  async clickReserveButton() {
    await this.page.getByRole('button', { name: 'Reservar' }).click();
  }

  /**
   * Este método permite ingresar texto al campo "Nombre" de flujo reserva
   * @param text - Texto que desea agregar a campo
   */
  async fillNameField(name: string) {
    await this.page.getByRole('textbox', { name: 'Nombre' }).fill(name);
  }

  /**
   * Este método permite ingresar texto al campo "Apellido" de flujo reserva
   * @param text - Texto que desea agregar a campo
   */
  async fillLastNameField(lastName: string) {
    await this.page.getByRole('textbox', { name: 'Apellido' }).fill(lastName);
  }

  /**
   * Este método permite ingresar texto al campo "Correo electrónico" de flujo reserva
   * @param text - Texto que desea agregar a campo
   */
  async fillEmailField(email: string) {
    await this.page.getByRole('textbox', { name: 'Correo electrónico' }).fill(email);
  }

  /**
   * Este método permite ingresar texto al campo "Teléfono" de flujo reserva
   * @param text - Texto que desea agregar a campo
   */
  async fillPhoneField(phone: string) {
    await this.page.getByRole('textbox', { name: 'Teléfono' }).fill(phone);
  }

  /**
   * Este método permite seleccionar el primer bloque horario disponible
   * @param resourceServiceId - ID del recurso-servicio
   * @param baseUrl - URL base de la API
   */
  async selectFirstAvailableTimeSlot(resourceServiceId: number, baseUrl: string): Promise<SelectedTimeSlot> {
    const today = new Date().toISOString().split('T')[0];

    const response = await this.page.request.get(`${baseUrl}/api/public/availability/${resourceServiceId}/week?startDate=${today}`);

    if (!response.ok()) {
      throw new Error(`Error al obtener disponibilidad: ${response.status()}`);
    }

    const data: AvailabilityResponse = await response.json();

    const firstAvailableDay: DaySchedule | undefined = data.weekSchedule.find(
      (day: DaySchedule) => day.isAvailable && day.timeSlots.length > 0,
    );

    if (!firstAvailableDay) {
      throw new Error('No hay bloques horarios disponibles en la semana');
    }

    const dayNumber = parseInt(firstAvailableDay.date.split('-')[2], 10);
    const hourPrefix = firstAvailableDay.timeSlots[0].substring(0, 2);

    await this.page.getByRole('button', { name: `${dayNumber}` }).click();
    await this.page.getByRole('button', { name: `${hourPrefix}:` }).click();

    return {
      date: firstAvailableDay.date,
      time: firstAvailableDay.timeSlots[0],
    };
  }
}
