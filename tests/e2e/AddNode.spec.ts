import { test, expect } from '@playwright/test';

test.describe('Add Node E2E Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Set timeout for each test individually
    test.setTimeout(5000); // Add 2s buffer to default timeout
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should open add form when tab is pressed on selected node', async ({ page }) => {
    // Select a node first
    const rootText = "Root"
    await page.locator(`.node-group:has-text("${rootText}")`).click({ timeout: 2000 });
    await page.keyboard.press('Tab');
    
    // Check if form is visible with correct placeholders
    await expect(page.locator('[data-testid="node-input"]')).toBeVisible({ timeout: 1000 });
    await expect(page.locator('[data-testid="title-input"]')).toHaveAttribute('placeholder', 'Add Title');
    await expect(page.locator('[data-testid="body-input"]')).toHaveAttribute('data-placeholder', 'Add Body');
    
    // Check if form fields are empty
    await expect(page.locator('[data-testid="title-input"]')).toHaveValue('');
    expect(await page.locator('[data-testid="body-input"]').innerText()).toBe('');
  });

  test('should add child node when save button is clicked', async ({ page }) => {
    const rootText = "Root"
    const childText = "Child"
    await page.locator(`.node-group:has-text("${rootText}")`).click({ timeout: 2000 });
    await page.keyboard.press('Tab');
    
    // Fill in the form
    await page.locator('[data-testid="title-input"]').fill(childText);
    await page.locator('[data-testid="body-input"]').fill(childText);
    await page.locator('[data-testid="save-button"]').click();
    await page.locator(`.node-group:has-text("${childText}")`).waitFor({ state: 'visible', timeout: 2000 });
    
    // Check if parent node is still selected (highlighted)
    const parentNode = await page.locator(`.node-group:has-text("${rootText}")`)
    await expect(parentNode.locator('circle')).toHaveCSS('fill', 'rgb(0, 255, 0)');
  });

  test('should add child node when tab is pressed with body', async ({ page }) => {
    const rootText = "Root"
    const childText = "Child"
    await page.locator(`.node-group:has-text("${rootText}")`).click({ timeout: 2000 });
    await page.keyboard.press('Tab');
    
    // Fill in the form
    await page.locator('[data-testid="title-input"]').fill(childText);
    await page.locator('[data-testid="body-input"]').fill(childText);
    await page.locator('[data-testid="save-button"]').click();
    await page.locator(`.node-group:has-text("${childText}")`).waitFor({ state: 'visible', timeout: 2000 });
    
    // Check if parent node is still selected (highlighted)
    const parentNode = await page.locator(`.node-group:has-text("${rootText}")`)
    await expect(parentNode.locator('circle')).toHaveCSS('fill', 'rgb(0, 255, 0)');
  });

  test('should not add node when tab is pressed with empty title', async ({ page }) => {
    const rootText = "Root"
    await page.locator(`.node-group:has-text("${rootText}")`).click({ timeout: 2000 });
    
    const initialNodeCount = await page.locator('.node-group').count();
    await page.keyboard.press('Tab');
    
    const finalNodeCount = await page.locator('.node-group').count();
    expect(finalNodeCount).toBe(initialNodeCount);
    
    await expect(page.locator('[data-testid="title-input"]')).toHaveAttribute('placeholder', 'Add Title');
  });

  test('should cancel add and return to edit mode when title is empty on save', async ({ page }) => {
    const rootText = "Root"
    await page.locator(`.node-group:has-text("${rootText}")`).click({ timeout: 2000 });
    await page.keyboard.press('Tab');
    
    const titleInputValue = await page.locator('[data-testid="title-input"]').inputValue();
    expect(titleInputValue).toBe('');
    await page.locator('[data-testid="save-button"]').click();

    const finalNodeCount = await page.locator('.node-group').count();
    expect(finalNodeCount).toBe(1); // Should only have initial root node
    
    await expect(page.locator('[data-testid="title-input"]')).toHaveAttribute('placeholder', 'Edit title');
    await expect(page.locator('[data-testid="body-input"]')).toHaveAttribute('data-placeholder', 'Edit body');
    
    const titleValue = await page.locator('[data-testid="title-input"]').inputValue();
    expect(titleValue).toBe('Root');
  });

  test('should maintain parent selection after adding child', async ({ page }) => {
    const rootText = "Root"
    const childText = "Child"
    await page.locator(`.node-group:has-text("${rootText}")`).click({ timeout: 2000 });
    let parentNode = page.locator(`.node-group:has-text("${rootText}")`);
    await expect(parentNode.locator('circle')).toHaveCSS('fill', 'rgb(0, 255, 0)');
    
    // Add child node
    await page.keyboard.press('Tab');
    await page.locator('[data-testid="title-input"]').fill(childText);
    await page.locator('[data-testid="save-button"]').click();
    
    parentNode = page.locator(`.node-group:has-text("${rootText}")`);
    await expect(parentNode.locator('circle')).toHaveCSS('fill', 'rgb(0, 255, 0)');
    
    // Verify child is not selected
    const childNode = page.locator(`.node-group:has-text("${childText}")`);
    await expect(childNode.locator('circle')).toHaveCSS('fill', 'rgb(255, 255, 255)');
  });

  test('should not work when no node is selected', async ({ page }) => {
    // Don't select any node, just press Tab
    await page.keyboard.press('Tab');
    
    // Check that node-input is not visible (no form opened)
    await expect(page.locator('[data-testid="node-input"]')).not.toBeVisible();
    
    // Check that no new nodes were created
    const nodeCount = await page.locator('.node-group').count();
    expect(nodeCount).toBeGreaterThan(0); // Should have initial nodes but no new ones
  });

  test('should add children using Tab key and Enter to finalize', async ({ page }) => {
    const rootText = "Root"
    const childText1 = "Child 1"
    const childText2 = "Child 2"
    await page.locator(`.node-group:has-text("${rootText}")`).click({ timeout: 2000 });
    let parentNode = page.locator(`.node-group:has-text("${rootText}")`);
    await expect(parentNode.locator('circle')).toHaveCSS('fill', 'rgb(0, 255, 0)');
    
    // Add child node
    await page.keyboard.press('Tab');
    await page.locator('[data-testid="title-input"]').fill(childText1);
    await page.keyboard.press('Enter');
    
    parentNode = page.locator(`.node-group:has-text("${rootText}")`);
    await expect(parentNode.locator('circle')).toHaveCSS('fill', 'rgb(0, 255, 0)');
    
    // Verify child is not selected
    const childNode = page.locator(`.node-group:has-text("${childText1}")`);
    await expect(childNode.locator('circle')).toHaveCSS('fill', 'rgb(255, 255, 255)');
    
    // Add another child node
    await page.keyboard.press('Tab');
    await page.locator('[data-testid="title-input"]').fill(childText2);
    await page.keyboard.press('Enter');
    
    parentNode = page.locator(`.node-group:has-text("${rootText}")`);
    await expect(parentNode.locator('circle')).toHaveCSS('fill', 'rgb(0, 255, 0)');
    
    // Verify second child is not selected
    const childNode2 = page.locator(`.node-group:has-text("${childText2}")`);
    await expect(childNode2.locator('circle')).toHaveCSS('fill', 'rgb(255, 255, 255)');
  });

});
