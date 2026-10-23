import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('TC-012 - Connexion avec identifiants valides', async ({ page }) => {
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  expect(username, 'La variable E2E_USERNAME doit être définie').toBeTruthy();
  expect(password, 'La variable E2E_PASSWORD doit être définie').toBeTruthy();

  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.login(username!, password!);

  await expect(loginPage.successMessage).toBeVisible();
  await expect(page.getByRole('heading', { name: 'SIGN IN' })).toBeHidden();
});

test('TC-013 - Connexion refusée avec un mot de passe incorrect', async ({ page }) => {
  const username = process.env.E2E_USERNAME;
  const password = 'MotDePasseVolontairementIncorrect123!';

  expect(username, 'La variable E2E_USERNAME doit être définie').toBeTruthy();

  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.login(username!, password);

  // À adapter au message d'erreur réellement affiché par Wonderlight.
  await expect(loginPage.errorMessage).toBeVisible();
});