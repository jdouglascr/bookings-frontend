import { test } from '../test-option';
import { expect } from '@playwright/test';
import { WebsitePage } from './page-objects/websitePage';

test.describe('Feature: Website', () => {
  test('Validar bloqueo de botón "Siguiente" al no seleccionar recurso', { tag: ['@regression'] }, async ({ page, baseUrl }) => {
    const websitePage = new WebsitePage(page);

    await test.step('Estoy en el website público', async () => {
      await page.goto(baseUrl);
    });

    await test.step('Selecciono el servicio "Corte Clásico"', async () => {
      await websitePage.selectService('Corte Clásico');
    });

    await test.step('Aparece paso 1 del flujo reserva con botón "Siguiente" deshabilitado', async () => {
      await expect(page.getByRole('heading', { name: 'Recurso' })).toBeVisible();
      await expect(page.getByText('Selecciona tu preferencia de reserva')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Paulo Contreras Paulo' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
    });
  });

  test('Validar selección de servicio habilitación de botón "Siguiente"', { tag: ['@regression'] }, async ({ page, baseUrl }) => {
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
      await page.getByRole('button', { name: 'Siguiente' }).click();
      await expect(page.getByRole('heading', { name: 'Horario' })).toBeVisible();
      await expect(page.getByText('Elige cuándo quieres tu reserva')).toBeVisible();
    });
  });
});
