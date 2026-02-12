import { test, expect } from '@playwright/test';

test.describe('Mind Map E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load mind map with initial nodes', async ({ page }) => {
    // Check if mind map container exists
    await expect(page.locator('#mindmap-container')).toBeVisible();
  });

  test('should check if same text is in title input', async ({ page }) => {
    await page.locator('.node-group').last().click();
    await page.locator('[data-testid="drawer"]').waitFor({ state: 'visible' });
    
    const nodeText = await page.locator('.node-group').last().locator('text').textContent();
    const titleInputValue = await page.locator('[data-testid="title-input"]').inputValue();
    
    expect(nodeText).toBeTruthy();
    expect(titleInputValue).toBe(nodeText);
    console.log('Node text:', nodeText);
    console.log('Title input value:', titleInputValue);
  });
});
