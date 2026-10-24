import { test, expect } from '@playwright/test';

test('TC-051 - Réserver une place de cinéma', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Connexion
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('user7');
  await page.getByRole('textbox', { name: 'Password' }).fill('user7Password');
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');

  // Sélection du film
  await page.getByRole('link', { name: 'Jurassic Park Jurassic Park' }).first().click();

  // Sélection de la séance
  await page.getByRole('button', { name: 'Sat 31 Oct' }).click();
  await page.getByRole('link', { name: ':22 PM Filling Fast' }).click();

  // Sélection d'une place disponible
  const availableSeats = page.locator('button[title]:not(:disabled)');
  await expect(availableSeats.first()).toBeVisible();
  await availableSeats.first().click();

  // Vérification de la sélection
  await expect(page.getByText(/1 Seat Selected/i)).toBeVisible();

  // Confirmation de la réservation
  await page.getByRole('button', { name: /Proceed to Pay/i }).click();

  // Vérification du résultat
  const bookingSuccess = page.getByText(/Booking confirmed!/i);
  const bookingError = page.getByText(
    /One or more seats were just taken/i
  );

  await expect(bookingSuccess.or(bookingError)).toBeVisible({
    timeout: 10000,
  });

  await expect(
    bookingError,
    'TC-051 : la réservation a été refusée, le siège est peut-être déjà pris'
  ).toBeHidden();

  await expect(bookingSuccess).toBeVisible();
});