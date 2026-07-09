import { test, expect } from '@playwright/test';
import { registerNewUser } from './utils';

test.describe('Navigazione catalogo e dettaglio prodotto', () => {
  test('un visitatore sfoglia i prodotti e filtra per titolo', async ({ page }) => {
    await page.goto('/products');

    await expect(page.getByRole('heading', { name: 'Prodotti' })).toBeVisible();
    const cardsBefore = page.locator('app-product-card');
    await expect(cardsBefore.first()).toBeVisible();

    await page.getByPlaceholder('Cerca per titolo').fill('Laptop');
    await page.waitForTimeout(400); // debounce lato client prima della richiesta

    const cards = page.locator('app-product-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toContainText('Laptop');
    }
  });

  test('un visitatore apre il dettaglio di un prodotto dal catalogo', async ({ page }) => {
    await page.goto('/products');

    const firstCard = page.locator('app-product-card').first();
    const title = await firstCard.locator('.title').textContent();
    await firstCard.getByRole('button', { name: 'Vai ai dettagli' }).click();

    await expect(page).toHaveURL(/\/product\/.+/);
    await expect(page.locator('mat-card-title')).toHaveText(title?.trim() ?? '');
  });

  test('un utente autenticato aggiunge un prodotto al carrello dal catalogo', async ({ page }) => {
    await registerNewUser(page);

    await page.goto('/products');
    const firstCard = page.locator('app-product-card').first();
    await firstCard.getByRole('button', { name: 'Aggiungi al carrello' }).click();

    const cartButton = page.getByRole('button', { name: 'Carrello', exact: true });
    await expect(cartButton).toBeVisible();
    await expect(cartButton.locator('.mat-badge-content')).toHaveText('1');
  });
});
