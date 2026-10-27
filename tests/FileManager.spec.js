const { test, expect } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { FileManagerPage } = require('../Pages/FileManagerPage');
const { HomePage } = require('../Pages/HomePage');
const { LoginPage } = require('../Pages/LoginPage');

// Load credentials from root credential.env

// Pick files from ~/Downloads
function getDownloadFiles(extensions, maxFiles = 3) {
  const dir = path.join(os.homedir(), 'Downloads');
  return fs
    .readdirSync(dir)
    .filter((f) => extensions.includes(path.extname(f).toLowerCase()))
    .slice(0, maxFiles)
    .map((f) => path.join(dir, f));
}



  test.describe('Untangled Pro - File Manager', () => {
  // 1. Declare variables at the describe block level
  let loginPage;
  let homePage;
  let fileManager;

  test.beforeEach(async ({ page }) => {
    // 2. Initialize them with the current test's 'page' fixture
    loginPage = new LoginPage(page);
    homePage = new HomePage(page); 
    fileManager = new FileManagerPage(page);

    await loginPage.goto();
    // Using environment variables or direct strings
    await loginPage.login(
      process.env.APP_USERNAME || 'yamunatest',
      process.env.APP_PASSWORD || 'Yamuna@123'
    );
await loginPage.assertLoginPageLoaded();

    await homePage.ClickLFM();
    await fileManager.assertPageLoaded();
  });

  test('Folder CRUD: create, rename, view, delete', async ({ page }) => {
    const folderName = `geography_${Date.now()}`;
    const renamedName = `Basics_${Date.now()}`;

    await test.step('Create folder', async () => {
      await fileManager.createFolder(folderName);
      await fileManager.assertItemVisible(folderName);
    });

    await test.step('Rename folder', async () => {
      await fileManager.renameFolder(folderName, renamedName);
      await fileManager.assertItemVisible(renamedName);
      await fileManager.assertItemNotVisible(folderName);
    });

    await test.step('View folder', async () => {
      const urlBefore = page.url();
      await fileManager.viewFolder(renamedName);
      await expect(page).not.toHaveURL(urlBefore);
      await page.goBack();
      await fileManager.assertPageLoaded();
    });

    await test.step('Delete folder', async () => {
      await fileManager.deleteFolder(renamedName);
      await fileManager.assertItemNotVisible(renamedName);
    });
  });
test('Upload files from Downloads', async () => {
    // Fetches ALL files matching these extensions
    const files = getDownloadFiles(['.xlsx', '.pdf', '.csv', '.docx', '.pptx', '.json']);
    
    test.skip(files.length === 0, 'No matching files found in ~/Downloads');

    // 2. Loop through and print the extension of each file to the console
    console.log(`--- Uploading ${files.length} file(s) ---`);
    for (const file of files) {
      const extension = path.extname(file);
      const fileName = path.basename(file);
      console.log(`Uploading file: ${fileName} | Extension: ${extension}`);
    }

    // 3. Uploads the entire array of files at once
    await fileManager.uploadFiles(files);

    for (const file of files) {
      await fileManager.assertFileUploaded(file);
    }
  });
});