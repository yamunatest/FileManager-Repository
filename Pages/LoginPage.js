const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
    this.url = 'https://untangled.cloudtesla.com/dashboard';
    this.expectedTitle ="Dashboard";
    // Locators
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
     await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.continueButton).toBeEnabled();
    await this.continueButton.click();
  }

  // ---------- Assertions ----------
  async assertLoginPageLoaded() {

    console.log('Page URL is  :', this.page.url());
    if(await expect(this.page).toHaveURL(this.url)){
      console.log('Dashboard Page is Loaded successfully');
    }
  
  }

  
}

module.exports = { LoginPage };