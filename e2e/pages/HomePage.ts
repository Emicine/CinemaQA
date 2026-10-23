import { type Page, type Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly catalogueHeading: Locator;
  readonly movieLinks: Locator;

  constructor(page: Page) {
    this.page = page;

    this.catalogueHeading = page.getByRole('heading', {
      name: /Now Showing/i,
    });

    this.movieLinks = page.locator('a[href^="/movies/"]').filter({ has: page.locator('img') });
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
}