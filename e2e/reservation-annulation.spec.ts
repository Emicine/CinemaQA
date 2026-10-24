
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('TC-059 - Annuler une réservation plus de 30 minutes avant la séance', async ({ page }) => {
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  expect(username, 'E2E_USERNAME doit être défini').toBeTruthy();
  expect(password, 'E2E_PASSWORD doit être défini').toBeTruthy();

  // 1. Se connecter
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(username!, password!);

  await expect(loginPage.successMessage).toBeVisible();

  // 2. Accéder aux réservations
  await page.getByRole('button', {
  name: 'U',
  exact: true,
}).click();
  await page.getByRole('link', { name: 'My Bookings' }).click();

  // 3. Annuler une réservation
  const cancelButton = page.getByRole('button', {
    name: 'Cancel Booking',
  }).first();

  await expect(
    cancelButton,
    'TC-059 : aucune réservation annulable trouvée'
  ).toBeVisible();

  await cancelButton.click();

  // 4. Confirmer l'annulation
  await page.getByRole('button', {
    name: 'Yes, Cancel',
  }).click();

  // 5. Vérifier la confirmation
  await expect(
    page.getByText('Reservation cancelled')
  ).toBeVisible();

  console.log('TC-059 : message de confirmation d’annulation affiché.');
});
