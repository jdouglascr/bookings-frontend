import { Page } from '@playwright/test';

export class ManagementPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Este método permite navegar al módulo "Calendario"
   * @param baseUrl - URL base de la aplicación
   */
  async navigateToCalendar(baseUrl: string) {
    await this.page.goto(`${baseUrl}/admin/calendar`);
  }

  /**
   * Este método permite presionar el botón "Crear reserva"
   */
  async clickCreateReservationButton() {
    await this.page.getByRole('button', { name: 'Crear reserva' }).click();
  }

  /**
   * Este método permite seleccionar un servicio
   * @param serviceName - Nombre del servicio
   */
  async selectService(serviceName: string) {
    await this.page.getByRole('button', { name: `${serviceName}` }).click();
  }

  /**
   * Este método permite presionar botón "Siguiente"
   */
  async clickNextButton() {
    await this.page.getByRole('button', { name: 'Siguiente' }).click();
  }
}
