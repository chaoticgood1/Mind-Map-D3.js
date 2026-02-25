import { test, expect } from '@playwright/test';

test.describe('Copy-Paste E2E Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.setTimeout(5000);
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should copy paste node', async ({ page }) => {
    await page.locator('[data-node-id="1"]').click({ timeout: 500, force: true });
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+v');
    
    // Check that there are now 2 node-group elements
    await expect(page.locator('.node-group')).toHaveCount(2);
    
    const nodeGroups = await page.locator('.node-group').all();
    const dataNodeIds: string[] = [];
    for (const nodeGroup of nodeGroups) {
      const dataNodeId = await nodeGroup.getAttribute('data-node-id');
      if (!dataNodeId) continue;
      expect(dataNodeIds).not.toContain(dataNodeId);
      dataNodeIds.push(dataNodeId);
    }
  });
});
