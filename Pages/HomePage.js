const { expect } = require('@playwright/test');

class HomePage {
  constructor(page) {
    this.page = page;
    this.FM = page.locator("//*[text()='File Manager']");
    this.SD = page.locator("//*[text()='Summary Dashboard']");
  }

  async ClickLFM() {
    await this.FM.hover();
    await this.FM.click();
    await this.page.mouse.move(300, 400);
  }
}

module.exports = { HomePage };