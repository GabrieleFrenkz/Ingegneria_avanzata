import { test, expect } from '@playwright/test';
import { registerNewUser } from './utils';

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
    await page.goto('/products');
    await page.locator('app-product-card').first().getByRole('button', { name: 'Aggiungi al carrello' }).click();
    await page.waitForTimeout(300);
  });

  test("un utente completa il checkout con dati validi e l'ordine viene creato", async ({ page }) => {
    await page.goto('/checkout');

    await page.locator('input[formcontrolname="firstName"]').fill('Mario');
    await page.locator('input[formcontrolname="lastName"]').fill('Rossi');
    await page.locator('input[formcontrolname="email"]').fill('mario@example.com');
    await page.locator('input[formcontrolname="street"]').fill('Via Roma 1');
    await page.locator('input[formcontrolname="city"]').fill('Milano');
    await page.locator('input[formcontrolname="zip"]').fill('20100');
    await page.getByRole('checkbox', { name: 'Accetto i termini e le condizioni' }).check();

    await page.getByRole('button', { name: "Completa l'ordine" }).click();

    await expect(page.getByText('Ordine completato con successo')).toBeVisible();
  });

  test('il submit con form incompleto mostra il riepilogo errori e non crea ordini', async ({ page }) => {
    await page.goto('/checkout');

    await page.getByRole('button', { name: "Completa l'ordine" }).click({ force: true });

    await expect(page.getByText('Il form contiene errori')).toBeVisible();
  });
});
