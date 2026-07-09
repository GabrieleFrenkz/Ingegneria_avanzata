import { test, expect } from '@playwright/test';
import { registerNewUser } from './utils';

test.describe('Gestione carrello', () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
    await page.goto('/products');
    await page.locator('app-product-card').first().getByRole('button', { name: 'Aggiungi al carrello' }).click();
    await page.waitForTimeout(300);
  });

  test('un utente incrementa e decrementa la quantità di un articolo nel carrello', async ({ page }) => {
    await page.goto('/cart');

    const item = page.locator('.cart-item').first();
    await expect(item.locator('.quantity')).toHaveText('1');

    await item.getByRole('button').filter({ has: page.locator('mat-icon', { hasText: 'add' }) }).click();
    await expect(item.locator('.quantity')).toHaveText('2');

    await item.getByRole('button').filter({ has: page.locator('mat-icon', { hasText: 'remove' }) }).click();
    await expect(item.locator('.quantity')).toHaveText('1');
  });

  test('un utente rimuove un articolo dal carrello', async ({ page }) => {
    await page.goto('/cart');

    const item = page.locator('.cart-item').first();
    await item.getByRole('button', { name: 'Remove item' }).click();

    await expect(page.getByText('Il tuo carrello è vuoto')).toBeVisible();
  });

  test('un utente svuota completamente il carrello', async ({ page }) => {
    await page.goto('/cart');

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Svuota Carrello' }).click();

    await expect(page.getByText('Il tuo carrello è vuoto')).toBeVisible();
  });
});
