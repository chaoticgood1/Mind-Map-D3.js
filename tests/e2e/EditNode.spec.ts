import { test, expect } from '@playwright/test';

test.describe('Mind Map E2E Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Set timeout for each test individually
    testInfo.setTimeout(5000);
    
    // Ensure clean slate for each test
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });


  test('should load mind map with initial nodes', async ({ page }) => {
    await expect(page.locator('#mindmap-container')).toBeVisible();
  });

  test('should check if same text is in title input', async ({ page }) => {
    const rootText = "Root"
    await page.locator(`.node-group:has-text("${rootText}")`).click({ timeout: 500 });
    const titleInput = await page.locator('[data-testid="title-input"]').inputValue();
    expect(titleInput).toBe(rootText);
    
    await page.locator(`.node-group:has-text("${rootText}")`).click({ timeout: 500 });
  });

  test('should edit root title', async ({ page }) => {
    const oldText = "Root"
    const newText = "New Title"

    await page.locator(`.node-group:has-text("${oldText}")`).click({ timeout: 500 });
    await page.locator('[data-testid="node-input"]').waitFor({ state: 'visible', timeout: 500 });
    await page.locator('[data-testid="title-input"]').fill(newText);
    await page.locator('[data-testid="save-button"]').click();

    await page.locator(`.node-group:has-text("${newText}")`).click({ timeout: 500 });
  });

  test('should edit root body', async ({ page }) => {
    await page.locator('.node-group:has-text("Root")').click({ timeout: 500 });
    await page.locator('[data-testid="node-input"]').waitFor({ state: 'visible', timeout: 500 });
    await page.locator('[data-testid="body-input"]').fill('New Body');
    await page.locator('[data-testid="save-button"]').click();
    
    // Click back on the node to reopen the edit form and verify the body was saved
    await page.locator('.node-group:has-text("Root")').click({ timeout: 500 });
    const updatedNodeText = await page.locator('[data-testid="body-input"]').inputValue();
    expect(updatedNodeText).toBe('New Body');
  });

  test('should not modify other child title when editing root title', async ({ page }) => {
    const childText = "Child Node"
    const newRootText = "New Root Title"

    // First, create a deeper tree structure to have multiple nodes
    await page.locator('.node-group:has-text("Root")').click({ timeout: 500 });
    await page.keyboard.press('Tab'); // Add a child to root
    await page.locator('[data-testid="title-input"]').fill(childText);
    await page.locator('[data-testid="save-button"]').click();
    
    // Now we have root + child, can test isolation
    await page.locator('.node-group:has-text("Root")').click({ timeout: 500 });
    await page.locator('[data-testid="title-input"]').fill(newRootText); // Edit child
    await page.locator('[data-testid="save-button"]').click();
    
    // Now go back to child and verify it wasn't affected
    await page.locator(`.node-group:has-text("${childText}")`).click({ timeout: 500 });
    const childTitleText = await page.locator('[data-testid="title-input"]').inputValue();
    expect(childTitleText).toBe(childText); // Child should be unchanged
  });

  test('should not modify child body when editing root body', async ({ page }) => {
    const childBodyText = "Child"
    const oldRootText = "Root"
    const newRootTitleText = "New Root"

    // First, create a deeper tree structure to have multiple nodes
    await page.locator(`.node-group:has-text("${oldRootText}")`).click({ timeout: 500 });
    await page.keyboard.press('Tab'); // Add a child to root
    await page.locator('[data-testid="title-input"]').fill(childBodyText);
    await page.locator('[data-testid="body-input"]').fill(childBodyText);
    await page.locator('[data-testid="save-button"]').click();
    
    // Now we have root + child, can test isolation
    await page.locator(`.node-group:has-text("${oldRootText}")`).click({ timeout: 500 });
    await page.locator('[data-testid="body-input"]').fill(newRootTitleText);
    await page.locator('[data-testid="save-button"]').click();
    
    // Now go back to child and verify it wasn't affected
    await page.locator(`.node-group:has-text("${childBodyText}")`).click({ timeout: 500 });
    const childTitleText = await page.locator('[data-testid="body-input"]').inputValue();
    expect(childTitleText).toBe(childBodyText); // Child should be unchanged
  });
});
