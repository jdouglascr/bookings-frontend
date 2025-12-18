import { test } from '../test-option';
import { expect } from '@playwright/test';
import { LoginPage } from './page-objects/loginPage';

const { ADMIN_EMAIL, ADMIN_PASSWORD, STAFF_EMAIL, STAFF_PASSWORD } = process.env;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !STAFF_EMAIL || !STAFF_PASSWORD) {
  throw new Error('ADMIN_EMAIL, ADMIN_PASSWORD, STAFF_EMAIL y STAFF_PASSWORD son requeridos');
}

test.describe('[Login] Seguridad', () => {
  test('Validar bloqueo al ingresar correo correcto pero contraseña incorrecta', { tag: ['@regression'] }, async ({ page, baseUrl }) => {
    const loginPage = new LoginPage(page);

    await test.step('Estoy en el login del panel administrativo', async () => {
      await loginPage.navigateToLoginPage(baseUrl);
    });

    await test.step('Ingreso correo correcto pero contraseña incorrecta', async () => {
      await loginPage.fillEmailField(ADMIN_EMAIL);
      await loginPage.fillPasswordField('123456789');
      await loginPage.clickEnterButton();
    });

    await test.step('Aparece mensaje de error "Credenciales inválidas" y no permite ingresar', async () => {
      await expect(page.getByText('Credenciales inválidas')).toBeVisible();
      await expect(page).toHaveURL(`${baseUrl}/login`);
    });
  });

  test('Validar bloqueo al ingresar correo incorrecto pero contraseña correcta', { tag: ['@regression'] }, async ({ page, baseUrl }) => {
    const loginPage = new LoginPage(page);

    await test.step('Estoy en el login del panel administrativo', async () => {
      await loginPage.navigateToLoginPage(baseUrl);
    });

    await test.step('Ingreso correo incorrecto pero contraseña correcta', async () => {
      await loginPage.fillEmailField('corre@incorrecto.cl');
      await loginPage.fillPasswordField(ADMIN_PASSWORD);
      await loginPage.clickEnterButton();
    });

    await test.step('Aparece mensaje de error "Credenciales inválidas" y no permite ingresar', async () => {
      await expect(page.getByText('Credenciales inválidas')).toBeVisible();
      await expect(page).toHaveURL(`${baseUrl}/login`);
    });
  });
});

test.describe('[Login] Roles', () => {
  test(
    'Validar ocultación de opciones administrativas a usuario con rol "Personal"',
    { tag: ['@regression'] },
    async ({ page, baseUrl }) => {
      const loginPage = new LoginPage(page);

      await test.step('Estoy en el login del panel administrativo', async () => {
        await loginPage.navigateToLoginPage(baseUrl);
      });

      await test.step('Ingreso credenciales de usuario con rol "Personal"', async () => {
        await loginPage.fillEmailField(STAFF_EMAIL);
        await loginPage.fillPasswordField(STAFF_PASSWORD);
        await loginPage.clickEnterButton();
      });

      await test.step('En menú lateral solamente aparece "Calendario"', async () => {
        await expect(page.getByRole('button', { name: 'Calendario' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Resumen' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Servicios' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Recursos' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Clientes' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Usuarios' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Mi negocio' })).toBeHidden();
      });
    },
  );

  test('Validar bloqueo de rutas administrativas a usuario con rol "Personal"', { tag: ['@regression'] }, async ({ page, baseUrl }) => {
    const loginPage = new LoginPage(page);

    await test.step('Estoy en el login del panel administrativo', async () => {
      await loginPage.navigateToLoginPage(baseUrl);
    });

    await test.step('Ingreso credenciales de usuario con rol "Personal"', async () => {
      await loginPage.fillEmailField(STAFF_EMAIL);
      await loginPage.fillPasswordField(STAFF_PASSWORD);
      await loginPage.clickEnterButton();
    });

    await test.step('Se bloquea acceso a rutas administrativas', async () => {
      await page.evaluate(() => {
        window.history.pushState({}, '', '/admin/dashboard');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      await expect(page).toHaveURL(`${baseUrl}/admin/calendar`);
      await page.evaluate(() => {
        window.history.pushState({}, '', '/admin/services');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      await expect(page).toHaveURL(`${baseUrl}/admin/calendar`);
      await page.evaluate(() => {
        window.history.pushState({}, '', '/admin/resources');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      await expect(page).toHaveURL(`${baseUrl}/admin/calendar`);
      await page.evaluate(() => {
        window.history.pushState({}, '', '/admin/customers');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      await expect(page).toHaveURL(`${baseUrl}/admin/calendar`);
      await page.evaluate(() => {
        window.history.pushState({}, '', '/admin/users');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      await expect(page).toHaveURL(`${baseUrl}/admin/calendar`);
      await page.evaluate(() => {
        window.history.pushState({}, '', '/admin/business');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      await expect(page).toHaveURL(`${baseUrl}/admin/calendar`);
    });
  });
});
