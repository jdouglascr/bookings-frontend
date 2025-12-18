import { test } from '../test-option';
import { expect } from '@playwright/test';
import { WebsitePage } from './page-objects/websitePage';
import { BookingCleanupHelper } from './helpers/booking-cleanup.helper';

test.describe('[Website] Flujo Reserva: Paso 1', () => {
  test('Validar bloqueo de botón "Siguiente" al no seleccionar recurso', { tag: ['@regression'] }, async ({ page, baseUrl }) => {
    const websitePage = new WebsitePage(page);

    await test.step('Estoy en el website público', async () => {
      await page.goto(baseUrl);
    });

    await test.step('Selecciono el servicio "Corte Clásico"', async () => {
      await websitePage.selectService('Corte Clásico');
    });

    await test.step('Aparece botón "Siguiente" deshabilitado', async () => {
      await expect(page.getByRole('heading', { name: 'Recurso' })).toBeVisible();
      await expect(page.getByText('Selecciona tu preferencia de reserva')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Paulo Contreras Paulo' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
    });
  });

  test('Validar habilitación de botón "Siguiente" al seleccionar recurso', { tag: ['@regression'] }, async ({ page, baseUrl }) => {
    const websitePage = new WebsitePage(page);

    await test.step('Estoy en paso 1 del flujo reserva', async () => {
      await page.goto(baseUrl);
      await websitePage.selectService('Corte Clásico');
    });

    await test.step('Selecciono el recurso "Paulo Contreras"', async () => {
      await websitePage.selectResource('Paulo Contreras');
    });

    await test.step('Se habilita botón "Siguiente" y permite avanzar a paso 2 del flujo reserva', async () => {
      await expect(page.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
      await websitePage.clickNextButton();
      await expect(page.getByRole('heading', { name: 'Horario' })).toBeVisible();
      await expect(page.getByText('Elige cuándo quieres tu reserva')).toBeVisible();
    });
  });
});

test.describe('[Website] Flujo Reserva: Paso 2', () => {
  test('Validar bloqueo de botón "Siguiente" al no seleccionar bloque horario', { tag: ['@regression'] }, async ({ page, baseUrl }) => {
    const websitePage = new WebsitePage(page);

    await test.step('Estoy en paso 1 del flujo reserva con recurso seleccionado', async () => {
      await page.goto(baseUrl);
      await websitePage.selectService('Corte Clásico');
      await websitePage.selectResource('Paulo Contreras');
    });

    await test.step('Presiono el botón "Siguiente"', async () => {
      await websitePage.clickNextButton();
    });

    await test.step('Se vuelve a bloquear el botón "Siguiente" en paso 2 del flujo reserva', async () => {
      await expect(page.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
    });
  });

  test(
    'Validar habilitación de botón "Siguiente" al seleccionar bloque horario',
    { tag: ['@regression'] },
    async ({ page, baseUrl, apiUrl }) => {
      const websitePage = new WebsitePage(page);

      await test.step('Estoy en paso 2 del flujo reserva', async () => {
        await page.goto(baseUrl);
        await websitePage.selectService('Corte Clásico');
        await websitePage.selectResource('Paulo Contreras');
        await websitePage.clickNextButton();
      });

      await test.step('Selecciono un bloque de horario disponible', async () => {
        await websitePage.selectFirstAvailableTimeSlot(1, apiUrl);
      });

      await test.step('Se habilita botón "Siguiente" y permite avanzar a paso 3 del flujo reserva', async () => {
        await expect(page.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
        await websitePage.clickNextButton();
        await expect(page.getByRole('heading', { name: 'Tus datos' })).toBeVisible();
        await expect(page.getByText('Información para contactarte')).toBeVisible();
      });
    },
  );
});

test.describe('[Website] Flujo Reserva: Paso 3', () => {
  test(
    'Validar bloqueo de botón "Siguiente" al no ingresar datos de contacto',
    { tag: ['@regression'] },
    async ({ page, baseUrl, apiUrl }) => {
      const websitePage = new WebsitePage(page);

      await test.step('Estoy en paso 2 del flujo reserva con bloque horario seleccionado', async () => {
        await page.goto(baseUrl);
        await websitePage.selectService('Corte Clásico');
        await websitePage.selectResource('Paulo Contreras');
        await websitePage.clickNextButton();
        await websitePage.selectFirstAvailableTimeSlot(1, apiUrl);
      });

      await test.step('Presiono el botón "Siguiente"', async () => {
        await websitePage.clickNextButton();
      });

      await test.step('Se vuelve a bloquear el botón "Siguiente" en paso 3 del flujo reserva', async () => {
        await expect(page.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
      });
    },
  );

  test(
    'Validar habilitación de botón "Siguiente" al ingresar datos de contacto',
    { tag: ['@regression'] },
    async ({ page, baseUrl, apiUrl }) => {
      const websitePage = new WebsitePage(page);

      await test.step('Estoy en paso 3 del flujo reserva', async () => {
        await page.goto(baseUrl);
        await websitePage.selectService('Corte Clásico');
        await websitePage.selectResource('Paulo Contreras');
        await websitePage.clickNextButton();
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
        await expect(page.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
        await websitePage.clickNextButton();
        await expect(page.getByRole('heading', { name: 'Resumen' })).toBeVisible();
        await expect(page.getByText('Revisa y confirma tu reserva')).toBeVisible();
      });
    },
  );
});

test.describe('[Website] Flujo Reserva: Paso 4', () => {
  test(
    'Validar habilitación de botón "Reservar" al completar todos los pasos previos',
    { tag: ['@regression'] },
    async ({ page, baseUrl, apiUrl }) => {
      const websitePage = new WebsitePage(page);

      await test.step('Estoy en paso 3 del flujo reserva con todos los campos de formulario de contacto completados', async () => {
        await page.goto(baseUrl);
        await websitePage.selectService('Corte Clásico');
        await websitePage.selectResource('Paulo Contreras');
        await websitePage.clickNextButton();
        await websitePage.selectFirstAvailableTimeSlot(1, apiUrl);
        await websitePage.clickNextButton();
        await websitePage.fillNameField('Test');
        await websitePage.fillLastNameField('Playwright');
        await websitePage.fillEmailField('pinaced892@kudimi.com');
        await websitePage.fillPhoneField('912345678');
      });

      await test.step('Presiono el botón "Siguiente"', async () => {
        await websitePage.clickNextButton();
      });

      await test.step('Se habilita botón "Reservar"', async () => {
        await expect(page.getByRole('button', { name: 'Reservar' })).toBeEnabled();
      });
    },
  );

  test('Validar funcionalidad de botón "Reservar"', { tag: ['@regression'] }, async ({ page, baseUrl, apiUrl }) => {
    const websitePage = new WebsitePage(page);

    await test.step('Estoy en paso 4 del flujo reserva con todos los pasos previos completados', async () => {
      await page.goto(baseUrl);
      await websitePage.selectService('Corte Clásico');
      await websitePage.selectResource('Paulo Contreras');
      await websitePage.clickNextButton();
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
      await expect(page.getByText('¡Reserva registrada')).toBeVisible();
    });

    await test.step('Limpieza: Eliminar reserva creada', async () => {
      const cleanup = new BookingCleanupHelper(page.request);
      await cleanup.authenticate(apiUrl, process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
      await cleanup.deleteLastBooking(apiUrl);
    });
  });
});
