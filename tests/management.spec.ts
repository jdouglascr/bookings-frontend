import { test } from '../test-option';
import { expect } from '@playwright/test';
import { WebsitePage } from './page-objects/websitePage';
import { BookingCleanupHelper } from './helpers/booking-cleanup.helper';
import { ManagementPage } from './page-objects/managementPage';

test.describe('[Panel Administración] Flujo Reserva: Paso 1', () => {
  test(
    'Validar bloqueo de botón "Siguiente" al no seleccionar servicio',
    { tag: ['@regression'] },
    async ({ authenticatedPage, baseUrl }) => {
      const managementPage = new ManagementPage(authenticatedPage);

      await test.step('Estoy en el módulo "Calendario"', async () => {
        await managementPage.navigateToCalendar(baseUrl);
      });

      await test.step('Presiono el botón "Crear reserva"', async () => {
        await managementPage.clickCreateReservationButton();
      });

      await test.step('Aparece botón "Siguiente" deshabilitado', async () => {
        await expect(authenticatedPage.getByRole('heading', { name: 'Servicio' })).toBeVisible();
        await expect(authenticatedPage.getByText('Selecciona el servicio')).toBeVisible();
        await expect(authenticatedPage.getByRole('button', { name: 'Corte Clásico Corte Clásico' })).toBeVisible();
        await expect(authenticatedPage.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
      });
    },
  );

  test(
    'Validar habilitación de botón "Siguiente" al seleccionar servicio',
    { tag: ['@regression'] },
    async ({ authenticatedPage, baseUrl }) => {
      const managementPage = new ManagementPage(authenticatedPage);

      await test.step('Estoy en paso 1 del flujo reserva', async () => {
        await managementPage.navigateToCalendar(baseUrl);
        await managementPage.clickCreateReservationButton();
      });

      await test.step('Selecciono el servicio "Corte Clásico"', async () => {
        await managementPage.selectService('Corte Clásico');
      });

      await test.step('Se habilita botón "Siguiente" y permite avanzar a paso 2 del flujo reserva', async () => {
        await expect(authenticatedPage.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
        await managementPage.clickNextButton();
        await expect(authenticatedPage.getByRole('heading', { name: 'Horario' })).toBeVisible();
        await expect(authenticatedPage.getByText('Elige cuándo quieres la reserva')).toBeVisible();
      });
    },
  );
});

test.describe('[Panel Administración] Flujo Reserva: Paso 2', () => {
  test(
    'Validar bloqueo de botón "Siguiente" al no seleccionar bloque horario',
    { tag: ['@regression'] },
    async ({ authenticatedPage, baseUrl }) => {
      const managementPage = new ManagementPage(authenticatedPage);

      await test.step('Estoy en paso 1 del flujo reserva con servicio seleccionado', async () => {
        await managementPage.navigateToCalendar(baseUrl);
        await managementPage.clickCreateReservationButton();
        await managementPage.selectService('Corte Clásico');
      });

      await test.step('Presiono el botón "Siguiente"', async () => {
        await managementPage.clickNextButton();
      });

      await test.step('Se vuelve a bloquear el botón "Siguiente" en paso 2 del flujo reserva', async () => {
        await expect(authenticatedPage.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
      });
    },
  );

  test(
    'Validar habilitación de botón "Siguiente" al seleccionar bloque horario',
    { tag: ['@regression'] },
    async ({ authenticatedPage, baseUrl, apiUrl }) => {
      const websitePage = new WebsitePage(authenticatedPage);
      const managementPage = new ManagementPage(authenticatedPage);

      await test.step('Estoy en paso 2 del flujo reserva', async () => {
        await managementPage.navigateToCalendar(baseUrl);
        await managementPage.clickCreateReservationButton();
        await managementPage.selectService('Corte Clásico');
        await managementPage.clickNextButton();
      });

      await test.step('Selecciono un bloque de horario disponible', async () => {
        await websitePage.selectFirstAvailableTimeSlot(1, apiUrl);
      });

      await test.step('Se habilita botón "Siguiente" y permite avanzar a paso 3 del flujo reserva', async () => {
        await expect(authenticatedPage.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
        await managementPage.clickNextButton();
        await expect(authenticatedPage.getByRole('heading', { name: 'Tus datos' })).toBeVisible();
        await expect(authenticatedPage.getByText('Información para contactarte')).toBeVisible();
      });
    },
  );
});

test.describe('[Panel Administración] Flujo Reserva: Paso 3', () => {
  test(
    'Validar bloqueo de botón "Siguiente" al no ingresar datos de contacto',
    { tag: ['@regression'] },
    async ({ authenticatedPage, baseUrl, apiUrl }) => {
      const websitePage = new WebsitePage(authenticatedPage);
      const managementPage = new ManagementPage(authenticatedPage);

      await test.step('Estoy en paso 2 del flujo reserva con bloque horario seleccionado', async () => {
        await managementPage.navigateToCalendar(baseUrl);
        await managementPage.clickCreateReservationButton();
        await managementPage.selectService('Corte Clásico');
        await managementPage.clickNextButton();
        await websitePage.selectFirstAvailableTimeSlot(1, apiUrl);
      });

      await test.step('Presiono el botón "Siguiente"', async () => {
        await managementPage.clickNextButton();
      });

      await test.step('Se vuelve a bloquear el botón "Siguiente" en paso 3 del flujo reserva', async () => {
        await expect(authenticatedPage.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
      });
    },
  );

  test(
    'Validar habilitación de botón "Siguiente" al ingresar datos de contacto',
    { tag: ['@regression'] },
    async ({ authenticatedPage, baseUrl, apiUrl }) => {
      const websitePage = new WebsitePage(authenticatedPage);
      const managementPage = new ManagementPage(authenticatedPage);

      await test.step('Estoy en paso 3 del flujo reserva', async () => {
        await managementPage.navigateToCalendar(baseUrl);
        await managementPage.clickCreateReservationButton();
        await managementPage.selectService('Corte Clásico');
        await managementPage.clickNextButton();
        await websitePage.selectFirstAvailableTimeSlot(1, apiUrl);
        await websitePage.clickNextButton();
      });

      await test.step('Relleno todos los campos de formulario de contacto', async () => {
        await websitePage.fillNameField('Test');
        await websitePage.fillLastNameField('Playwright');
        await websitePage.fillEmailField('pinaced892@kudimi.com');
        await websitePage.fillPhoneField('912345678');
      });

      await test.step('Se habilita botón "Siguiente" y permite avanzar a paso 4 del flujo reserva', async () => {
        await expect(authenticatedPage.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
        await managementPage.clickNextButton();
        await expect(authenticatedPage.getByRole('heading', { name: 'Resumen' })).toBeVisible();
        await expect(authenticatedPage.getByText('Revisa y confirma tu reserva')).toBeVisible();
      });
    },
  );
});

test.describe('[Panel Administración] Flujo Reserva: Paso 4', () => {
  test(
    'Validar habilitación de botón "Reservar" al completar todos los pasos previos',
    { tag: ['@regression'] },
    async ({ authenticatedPage, baseUrl, apiUrl }) => {
      const websitePage = new WebsitePage(authenticatedPage);
      const managementPage = new ManagementPage(authenticatedPage);

      await test.step('Estoy en paso 3 del flujo reserva con todos los campos de formulario de contacto completados', async () => {
        await managementPage.navigateToCalendar(baseUrl);
        await managementPage.clickCreateReservationButton();
        await managementPage.selectService('Corte Clásico');
        await managementPage.clickNextButton();
        await websitePage.selectFirstAvailableTimeSlot(1, apiUrl);
        await websitePage.clickNextButton();
        await websitePage.fillNameField('Test');
        await websitePage.fillLastNameField('Playwright');
        await websitePage.fillEmailField('pinaced892@kudimi.com');
        await websitePage.fillPhoneField('912345678');
      });

      await test.step('Presiono el botón "Siguiente"', async () => {
        await managementPage.clickNextButton();
      });

      await test.step('Se habilita botón "Reservar"', async () => {
        await expect(authenticatedPage.getByRole('button', { name: 'Reservar' })).toBeEnabled();
      });
    },
  );

  test('Validar funcionalidad de botón "Reservar"', { tag: ['@regression'] }, async ({ authenticatedPage, baseUrl, apiUrl }) => {
    const websitePage = new WebsitePage(authenticatedPage);
    const managementPage = new ManagementPage(authenticatedPage);

    await test.step('Estoy en paso 4 del flujo reserva con todos los pasos previos completados', async () => {
      await managementPage.navigateToCalendar(baseUrl);
      await managementPage.clickCreateReservationButton();
      await managementPage.selectService('Corte Clásico');
      await managementPage.clickNextButton();
      await websitePage.selectFirstAvailableTimeSlot(1, apiUrl);
      await websitePage.clickNextButton();
      await websitePage.fillNameField('Test');
      await websitePage.fillLastNameField('Playwright');
      await websitePage.fillEmailField('pinaced892@kudimi.com');
      await websitePage.fillPhoneField('912345678');
      await websitePage.clickNextButton();
    });

    await test.step('Presiono el botón "Reservar"', async () => {
      await websitePage.clickReserveButton();
    });

    await test.step('Se genera nueva reserva de forma exitosa', async () => {
      await expect(authenticatedPage.getByText('¡Reserva registrada')).toBeVisible();
    });

    await test.step('Limpieza: Eliminar reserva creada', async () => {
      const cleanup = new BookingCleanupHelper(authenticatedPage.request);
      await cleanup.authenticate(apiUrl, process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
      await cleanup.deleteLastBooking(apiUrl);
    });
  });
});
