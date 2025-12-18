import { Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Este método permite navegar a la página del Login
   * @param baseURL
   */
  async navigateToLoginPage(baseURL: string) {
    await this.page.goto(`${baseURL}/login`);
  }

  /**
   * Este método permite ingresar texto al campo "Correo" del Login
   * @param text - Texto que desea agregar a campo
   */
  async fillEmailField(email: string) {
    await this.page.getByRole('textbox', { name: 'Correo' }).fill(email);
  }

  /**
   * Este método permite ingresar texto al campo "Contraseña" del Login
   * @param text - Texto que desea agregar a campo
   */
  async fillPasswordField(password: string) {
    await this.page.getByRole('textbox', { name: 'Contraseña' }).fill(password);
  }

  /**
   * Este método permite presionar el botón "Entrar"
   */
  async clickEnterButton() {
    await this.page.getByRole('button', { name: 'Entrar' }).click();
  }
}
