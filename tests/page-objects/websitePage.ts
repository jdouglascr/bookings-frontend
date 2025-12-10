import { Page } from '@playwright/test';

export class WebsitePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Este método permite seleccionar un servicio
   * @param text - Nombre del servicio
   */
  async selectService(serviceName: string) {
    await this.page.getByRole('heading', { name: `${serviceName}` }).click();
  }

  /**
   * Este método permite seleccionar un recurso
   * @param text - Nombre del recurso
   */
  async selectResource(resourceName: string) {
    await this.page.getByRole('button', { name: `${resourceName}` }).click();
  }
}
