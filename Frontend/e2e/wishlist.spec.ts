import { test, expect } from '@playwright/test';
import { registerNewUser } from './utils';

test.describe('Wishlist', () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
  });

  test('un utente aggiunge un prodotto alla wishlist dal catalogo e lo vede nella pagina wishlist', async ({ page }) => {
    await page.goto('/products');

    const firstCard = page.locator('app-product-card').first();
    const title = (await firstCard.locator('.title').textContent())?.trim();
    await firstCard.getByRole('button', { name: 'Add to wishlist' }).click();

    await expect(page.getByRole('button', { name: 'Lista desideri' })).toBeVisible();
    await page.getByRole('button', { name: 'Lista desideri' }).click();

    await expect(page).toHaveURL(/\/wishlist$/);
    await expect(page.locator('.wishlist-item')).toHaveCount(1);
    await expect(page.locator('.wishlist-item .product-title')).toContainText(title ?? '');
  });

  test('un utente rimuove un prodotto dalla wishlist', async ({ page }) => {
    await page.goto('/products');
    await page.locator('app-product-card').first().getByRole('button', { name: 'Add to wishlist' }).click();

    await page.goto('/wishlist');
    await page.getByRole('button', { name: 'Rimuovi dalla lista' }).click();

    await expect(page.getByText('La tua lista desideri è vuota')).toBeVisible();
  });

  test('un utente aggiunge tutti gli articoli della wishlist al carrello', async ({ page }) => {
    await page.goto('/products');
    await page.locator('app-product-card').first().getByRole('button', { name: 'Add to wishlist' }).click();

    await page.goto('/wishlist');
    await page.getByRole('button', { name: 'Aggiungi Tutto al Carrello' }).click();

    await expect(page.locator('.mat-badge-content').first()).toHaveText('1', { timeout: 10_000 });
  });
});
