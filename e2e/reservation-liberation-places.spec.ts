
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('TC-062 - Vérifier que les places sont libérées après annulation', async ({ page }) => {
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  expect(username).toBeTruthy();
  expect(password).toBeTruthy();

  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(username!, password!);
  await expect(loginPage.successMessage).toBeVisible();

  // Ouvrir Jurassic Park et choisir la séance
  await page.getByRole('link', {
    name: 'Jurassic Park Jurassic Park',
  }).first().click();

  await page.getByRole('button', { name: 'Sat 31 Oct' }).click();
  await page.getByRole('link', { name: ':22 PM Filling Fast' }).click();

  // Sélectionner un siège et réserver
  const seat = page.getByRole('button', { name: 'Standard — €' }).nth(2);
  await expect(seat).toBeVisible();
  await seat.click();
  await page.getByRole('button', { name: 'Proceed to Pay →' }).click();

  // Ouvrir l'historique et annuler la réservation
  await page.getByRole('button', { name: 'U', exact: true }).click();
  await page.getByRole('link', { name: 'My Bookings' }).click();

  const cancelButton = page.getByRole('button', {
    name: 'Cancel Booking',
  }).first();

  await expect(cancelButton).toBeVisible();
  await cancelButton.click();
  await page.getByRole('button', { name: 'Yes, Cancel' }).click();
  await expect(page.getByText('Reservation cancelled')).toBeVisible();

  // Retourner à la même séance et vérifier la disponibilité
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', {
    name: 'Jurassic Park Jurassic Park',
  }).first().click();

  await page.getByRole('button', { name: 'Sat 31 Oct' }).click();
  await page.getByRole('link', { name: ':22 PM Filling Fast' }).click();

  // Vérifier que le siège est sélectionnable de nouveau
  const releasedSeat = page.getByRole('button', {
    name: 'Standard — €',
  }).nth(2);

  await expect(releasedSeat).toBeEnabled();
  console.log('TC-062 : le siège est de nouveau sélectionnable.');
});
