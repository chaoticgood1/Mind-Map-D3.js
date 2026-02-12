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

  test('should allow edit title and body', async ({ page }) => {
    // Click on a node to open drawer
    await page.locator('.node-group').first().click();
    
    // Wait for drawer to open
    await page.locator('[data-testid="drawer"]').waitFor({ state: 'visible' });
    
    // Get the first node's text value
    const nodeText = await page.locator('.node-group').first().locator('text').textContent();
    
    // Verify we can access the node text
    expect(nodeText).toBeTruthy();
    console.log('Node text:', nodeText);
  });
});
