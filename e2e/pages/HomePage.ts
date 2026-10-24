import { expect, type Page, type Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly catalogueHeading: Locator;
  readonly movieLinks: Locator;
  readonly profileButton: Locator;
  readonly myBookingsLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.catalogueHeading = page.getByRole('heading', {
      name: /Now Showing/i,
    });

    this.movieLinks = page.locator('a[href^="/movies/"]').filter({ has: page.locator('img') });

    this.profileButton = page.getByRole('button', {name: /user|profile|account/i});
    this.myBookingsLink = page.getByRole('link', {name: 'My Bookings', exact: true});
  }

  async open() {
    await this.page.goto('/');
  }

  async getMovieCount(): Promise<number> {
    return await this.movieLinks.count();
  }

  async openFirstMovie() {
    await this.movieLinks.first().click();
  }

  async openMyBookings() {
  await this.profileButton.click();
  await this.myBookingsLink.click();
  await expect(this.page).toHaveURL(/\/reservations/);
}
}