import { test, expect } from '@playwright/test';

test('TC-051 - Réserver une place de cinéma', async ({ page }) => {
  const apiUrl = (process.env.API_URL || 'http://localhost:8080')
    .replace(/\/$/, '');

  // CONNEXION
  await page.goto('http://localhost:3000/');

  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.getByRole('textbox', { name: 'Username' })
    .fill(process.env.E2E_USERNAME!);

  await page.getByRole('textbox', { name: 'Password' })
    .fill(process.env.E2E_PASSWORD!);

  await page.getByRole('textbox', { name: 'Password' }).press('Enter');

  // SÉLECTION DU FILM
  await page.getByRole('link', { name: /Cool Runnings/ })
    .first()
    .click();

  // SÉLECTION DE LA DATE
  await page.getByRole('button', { name: /Wed\s+4 Nov/ }).click();

  // SÉLECTION DU CINÉMA ET DE LA SÉANCE
  const theatreCard = page
    .getByRole('heading', { name: 'CineTest2' })
    .locator('xpath=../../..');

  await theatreCard
    .getByRole('link', { name: /3:16 PM/ })
    .click();

  // SÉLECTION D'UNE PLACE
  const seat = page
    .locator('button[title="Couple — €20"]')
    .first();

  await expect(seat).toBeVisible();
  await expect(seat).toBeEnabled();

  await seat.click();

  // VÉRIFICATION DE LA SÉLECTION
  await expect(page.getByText(/1 Seat Selected/i)).toBeVisible();

  await expect(
    page.getByText('€20', { exact: true }).first()
  ).toBeVisible();

  // PRÉPARER LA RÉCUPÉRATION DE LA RÉPONSE DE RÉSERVATION
  const reservationResponsePromise = page.waitForResponse(response =>
    response.url().includes('/api/reservations/reserve') &&
    response.request().method() === 'POST'
  );

  // CONFIRMATION DE LA RÉSERVATION
  await page.getByRole('button', {
    name: /Proceed to Pay/i
  }).click();

  const reservationResponse = await reservationResponsePromise;

  expect(
    reservationResponse.status(),
    'La réservation doit être créée avec succès'
  ).toBe(201);

  const reservationBody = await reservationResponse.json();
  const reservationId = reservationBody.data;

  expect(reservationId).toBeTruthy();

  await expect(
    page.getByText(/Booking confirmed!/i)
  ).toBeVisible({ timeout: 10000 });

  // NETTOYAGE AUTOMATIQUE VIA L'API
  // CONNEXION DU COMPTE DE TEST À L'API
  const loginResponse = await page.request.post(
    `${apiUrl}/auth/login`,
    {
      data: {
        username: process.env.E2E_USERNAME,
        password: process.env.E2E_PASSWORD
      }
    }
  );

  expect(loginResponse.status()).toBe(200);

  const loginBody = await loginResponse.json();
  const token = loginBody.authenticationToken;

  expect(token).toBeTruthy();

  // ANNULATION DE LA RÉSERVATION CRÉÉE
  const cancelResponse = await page.request.put(
    `${apiUrl}/api/reservations/cancel/${reservationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  expect(
    cancelResponse.status(),
    'La réservation doit être annulée via l’API'
  ).toBe(200);

  const cancelBody = await cancelResponse.json();

  expect(cancelBody.message).toContain('cancelled successfully');
});