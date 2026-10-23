import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test('la section Now Showing est visible lorsque des films sont disponibles', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.open();

  const filmsDisponibles = await homePage.getMovieCount();

  test.skip(
    filmsDisponibles === 0,
    'Aucun film disponible : vérifier le backend et les données.'
  );

  await expect(homePage.catalogueHeading).toBeVisible();
});

test('TC-027 - Afficher la liste des films disponibles', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.open();

  await expect(homePage.catalogueHeading).toBeVisible();
  await expect(homePage.movieLinks.first()).toBeVisible();
  expect(await homePage.getMovieCount()).toBeGreaterThan(0);
});