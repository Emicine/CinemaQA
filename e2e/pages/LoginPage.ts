import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly signInButton: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.signInButton = page.getByRole('button', {
      name: 'Sign In',
      exact: true,
    }).first();

    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');

    this.submitButton = page.getByRole('button', {
      name: 'Sign In',
      exact: true,
    }).last();

    this.successMessage = page.getByText('Welcome back!');

    this.errorMessage = page.getByRole('alert');
  }

  async open() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.signInButton.click();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}