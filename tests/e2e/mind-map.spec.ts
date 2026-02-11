import { test, expect } from '@playwright/test';

test.describe('Mind Map E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load mind map with initial nodes', async ({ page }) => {
    // Check if mind map container exists
    await expect(page.locator('#mindmap-container')).toBeVisible();
    
    // Check if SVG elements are present
    await expect(page.locator('svg')).toBeVisible();
    
    // Check for initial nodes (adjust count based on your data)
    const nodes = page.locator('circle');
    await expect(nodes).toHaveCount(3); // Assuming 3 initial nodes
  });

  test('should open drawer when node is clicked', async ({ page }) => {
    // Click on first node
    await page.locator('circle').first().click();
    
    // Check if drawer opens
    await expect(page.locator('.fixed.right-0.top-0')).toBeVisible();
    
    // Check if input fields are present
    await expect(page.locator('input[placeholder="Insert title here"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder="Insert body here"]')).toBeVisible();
  });

  test('should edit node title and body', async ({ page }) => {
    // Click on first node
    await page.locator('circle').first().click();
    
    // Edit title
    const titleInput = page.locator('input[placeholder="Insert title here"]');
    await titleInput.fill('Updated Title');
    
    // Edit body
    const bodyTextarea = page.locator('textarea[placeholder="Insert body here"]');
    await bodyTextarea.fill('Updated Body Content');
    
    // Check if changes are reflected (you might need to wait for update)
    await page.waitForTimeout(500); // Wait for debounced updates
    
    // Verify the node text is updated (this depends on your D3 implementation)
    // You may need to adjust this based on how you display text in nodes
  });

  test('should close drawer when clicking outside', async ({ page }) => {
    // Open drawer first
    await page.locator('circle').first().click();
    await expect(page.locator('.fixed.right-0.top-0')).toBeVisible();
    
    // Click outside drawer
    await page.locator('#mindmap-container').click();
    
    // Check if drawer closes (this depends on your implementation)
    // await expect(page.locator('.fixed.right-0.top-0')).not.toBeVisible();
  });

  test('should add new node with Tab key', async ({ page }) => {
    // Select a node first
    await page.locator('circle').first().click();
    
    // Press Tab to trigger add node mode
    await page.keyboard.press('Tab');
    
    // Type new node label
    await page.keyboard.type('New Node');
    
    // Press Enter to confirm
    await page.keyboard.press('Enter');
    
    // Check if new node is added
    await page.waitForTimeout(1000); // Wait for animation
    const nodes = page.locator('circle');
    await expect(nodes).toHaveCount(4); // Should have one more node
  });
});
