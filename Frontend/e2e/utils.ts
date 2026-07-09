import { Page, expect } from '@playwright/test';

export async function registerNewUser(
  page: Page,
  { firstName = 'Mario', lastName = 'Rossi' }: { firstName?: string; lastName?: string } = {}
): Promise<string> {
  const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 100000)}@example.com`;

  await page.goto('/register');
  await page.getByLabel('First Name').fill(firstName);
  await page.getByLabel('Last Name').fill(lastName);
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill('password123');
  await page.getByLabel('Confirm Password').fill('password123');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page).toHaveURL(/\/products$/);

  return email;
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
