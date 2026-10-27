const { expect } = require('@playwright/test');
const path = require('path');

class FileManagerPage {
  constructor(page) {
    this.page = page;

    // ---------- Locators ----------
    this.searchInput = page.getByPlaceholder('Search items');
    this.createOrUploadButton = page.getByRole('button', { name: 'Create or Upload' });

    // menu options
    this.createFolderOption = page.locator("//*[normalize-space(text())='Create Folder']");
    this.fileUploadOption = page.locator("//*[normalize-space(text())='File Upload']");
    this.folderUploadOption = page.locator("//*[normalize-space(text())='Folder Upload']");

    // dialogs (Angular Material)
    this.dialogInput = page.getByPlaceholder('Type Folder Name');
     this.EditdialogInput = page.getByPlaceholder('Type here');
    
    this.submitButton = page.locator("//*[normalize-space(text())='Submit']");
    this.okButton = page.locator("//*[normalize-space(text())='OK']");
    this.uploadOptionsTitle = page.locator("//*[normalize-space(text())='Upload options']");
    this.uploadButton = page.locator("//*[normalize-space(text())='Upload']");
    this.deletingSpinnerText = page.getByText('Deleting, please wait...');

    // row action menu items
    this.renameMenuItem = page.locator("//*[normalize-space(text())='Rename']");
    this.deleteMenuItem = page.locator("//*[normalize-space(text())='Delete']");
  }

  // ---------- Helpers ----------
  // A table row for a folder/file, found by its name (no more nth(0) guessing)
  row(name) {
    return this.page.locator('tr', { hasText: name });
  }

  async _openRowMenu(name) {
    await this.row(name).locator('i.bi.bi-three-dots-vertical').click();
  }

  async _clickOkIfShown(timeout = 10000) {
    const shown = await this.okButton
      .first()
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
    if (shown) await this.okButton.first().click();
    return shown;
  }

  // ---------- Actions ----------
  async assertPageLoaded() {
    //await expect(this.searchInput).toBeVisible();
await this.searchInput.waitFor({ state: 'visible' });
  }

  async createFolder(name) {
    await this.createOrUploadButton.click();
    await this.createFolderOption.click();
     await this.dialogInput.click();
    await this.dialogInput.fill(name);
    await expect(this.dialogInput).toHaveValue(name);
    await this.submitButton.click();
    await this._clickOkIfShown();
  }

  async renameFolder(oldName, newName) {
    await this._openRowMenu(oldName);
    await this.renameMenuItem.click();
    await this.EditdialogInput.clear();
    await this.EditdialogInput.fill(newName);
    await this.submitButton.click();
    await this._clickOkIfShown();
  }

  async viewFolder(name) {
    // the folder icon is the first cell icon of the row
    await this.row(name).locator('td i').first().click();
  }

  async deleteFolder(name) {
    await this._openRowMenu(name);
    await this.deleteMenuItem.click();
    await this._clickOkIfShown();
    // wait for the delete spinner to appear and go away (if it shows up)
    await this.deletingSpinnerText.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  }

  // Each upload needs its own filechooser: one chooser can't be reused for several files
  async uploadFile(filePath) {
    await this.createOrUploadButton.hover();
    await this.createOrUploadButton.click();

    const [chooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.fileUploadOption.click(),
    ]);
    await chooser.setFiles(filePath);

    // "Upload options" popup only appears sometimes (e.g. duplicate names)
    const optionsShown = await this.uploadOptionsTitle
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (optionsShown) await this.uploadButton.click();

    await this._clickOkIfShown(15000);
    console.log('Uploaded:', filePath);
  }

  async uploadFiles(filePaths) {
    for (const filePath of filePaths) {
      await this.uploadFile(filePath);
    }
  }

  async searchFor(text) {
    await this.searchInput.fill(text);
  }

  // ---------- Assertions ----------
  async assertItemVisible(name) {
    await expect(this.row(name).first()).toBeVisible();
  }

  async assertItemNotVisible(name) {
    await expect(this.row(name)).toHaveCount(0);
  }

  async assertFileUploaded(filePath) {
    await this.assertItemVisible(path.basename(filePath));
  }
}

module.exports = { FileManagerPage };