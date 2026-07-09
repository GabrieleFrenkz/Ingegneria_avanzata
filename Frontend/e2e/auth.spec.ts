import { test, expect } from '@playwright/test';

const userMenu = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: 'Menu utente' });

test.describe('Autenticazione', () => {
  test('un nuovo utente si registra e viene reindirizzato al catalogo da loggato', async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;

    await page.goto('/register');
    await page.getByLabel('First Name').fill('Mario');
    await page.getByLabel('Last Name').fill('Rossi');
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL(/\/products$/);
    await expect(userMenu(page)).toContainText('Mario');
  });

  test('un utente registrato può fare logout e ripetere il login', async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;

    await page.goto('/register');
    await page.getByLabel('First Name').fill('Luigi');
    await page.getByLabel('Last Name').fill('Verdi');
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/\/products$/);

    await userMenu(page).click();
    await page.getByRole('menuitem', { name: 'Esci' }).click();
    await expect(page.getByRole('button', { name: 'Accedi' })).toBeVisible();

    await page.getByRole('button', { name: 'Accedi' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/products$/);
    await expect(userMenu(page)).toContainText('Luigi');
  });

  test('login con credenziali sbagliate mostra un messaggio di errore e resta sulla pagina di login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('nonexistent@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('.error-message')).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/login');
  });

  test("l'utente admin seedato fa login e viene reindirizzato al pannello admin", async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: 'Pannello Admin' })).toBeVisible();
  });
});
