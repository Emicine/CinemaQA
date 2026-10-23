import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test('TC-028 - Consulter le détail d’un film', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.open();

  // Vérifier qu'au moins un film est disponible
  expect(await homePage.getMovieCount()).toBeGreaterThan(0);

  // Récupérer le titre du premier film avant de cliquer
  // Récupérer le titre du premier film avant de cliquer
  const firstMovie = homePage.movieLinks.first();
  const movieTitle = (
    await firstMovie.innerText()
  ).trim().split('\n')[0];


  // Ouvrir la fiche de ce film
  await homePage.openFirstMovie();

  // Vérifier l'URL et le titre de la fiche
  await expect(page).toHaveURL(/\/movies\/\d+/);
  await expect(
    page.getByRole('heading', {
      name: movieTitle,
      exact: false,
    })
  ).toBeVisible();

  // Vérifier que le bouton de réservation est présent
  await expect(
    page.getByRole('link', { name: /Book Tickets/i })
  ).toBeVisible();
});