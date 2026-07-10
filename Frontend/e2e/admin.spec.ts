import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils';

test.describe('Pannello Admin', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('un admin crea, modifica ed elimina un prodotto', async ({ page }) => {
    const productId = `e2e-prod-${Date.now()}`;
    const originalTitle = `Prodotto E2E ${Date.now()}`;
    const updatedTitle = `${originalTitle} (aggiornato)`;

    await page.getByRole('button', { name: 'Gestione Prodotti' }).click();

    await page.locator('input[formcontrolname="id"]').fill(productId);
    await page.locator('input[formcontrolname="title"]').fill(originalTitle);
    await page.locator('input[formcontrolname="price"]').fill('19.99');
    await page.locator('input[formcontrolname="original_price"]').fill('19.99');
    await page.locator('input[formcontrolname="quantity"]').fill('15');
    await page.getByRole('button', { name: 'Crea Prodotto' }).click();

    const row = page.locator('tr', { hasText: productId });
    await expect(row).toBeVisible();
    await expect(row).toContainText(originalTitle);

    await row.getByRole('button', { name: 'Modifica' }).click();
    await page.locator('input[formcontrolname="title"]').fill(updatedTitle);
    await page.getByRole('button', { name: 'Aggiorna Prodotto' }).click();

    const updatedRow = page.locator('tr', { hasText: productId });
    await expect(updatedRow).toContainText(updatedTitle);

    page.once('dialog', (dialog) => dialog.accept());
    await updatedRow.getByRole('button', { name: 'Elimina' }).click();
    await expect(page.locator('tr', { hasText: productId })).toHaveCount(0);
  });

  test('un admin regola la quantità di un prodotto', async ({ page }) => {
    const productId = `e2e-prod-qty-${Date.now()}`;

    await page.getByRole('button', { name: 'Gestione Prodotti' }).click();
    await page.locator('input[formcontrolname="id"]').fill(productId);
    await page.locator('input[formcontrolname="title"]').fill('Prodotto Quantità E2E');
    await page.locator('input[formcontrolname="price"]').fill('5');
    await page.locator('input[formcontrolname="original_price"]').fill('5');
    await page.locator('input[formcontrolname="quantity"]').fill('20');
    await page.getByRole('button', { name: 'Crea Prodotto' }).click();

    const row = page.locator('tr', { hasText: productId });
    await expect(row).toBeVisible();

    await row.getByRole('button', { name: 'Aggiungi 10' }).click();
    await expect(row).toContainText('30');

    await row.getByRole('button', { name: 'Rimuovi 10' }).click();
    await row.getByRole('button', { name: 'Rimuovi 10' }).click();
    await expect(row).toContainText('10');

    page.once('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: 'Elimina' }).click();
  });

  test('un admin visualizza la sezione statistiche', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Statistiche' })).toBeVisible();
    await expect(page.getByText('Ordini Totali')).toBeVisible();
    await expect(page.getByText('Prodotti Totali')).toBeVisible();
  });

  test('un admin visualizza lo storico ordini', async ({ page }) => {
    await page.getByRole('button', { name: 'Storico Ordini' }).click();

    await expect(page.getByRole('heading', { name: 'Storico Ordini' })).toBeVisible();
  });
});
