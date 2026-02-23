import { test, expect } from '@playwright/test';

test.describe('Add Node E2E Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Set timeout for each test individually
    test.setTimeout(testInfo.timeout + 2000); // Add 2s buffer to default timeout
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should open add form when tab is pressed on selected node', async ({ page }) => {
    // Select a node first
    await page.locator('.node-group').first().click({ timeout: 500 });
    await page.waitForTimeout(100);
    
    // Press Tab to open add form
    await page.keyboard.press('Tab');
    
    // Check if form is visible with correct placeholders
    await expect(page.locator('[data-testid="node-input"]')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('[data-testid="title-input"]')).toHaveAttribute('placeholder', 'Add Title');
    await expect(page.locator('[data-testid="body-input"]')).toHaveAttribute('placeholder', 'Add Body');
    
    // Check if form fields are empty
    await expect(page.locator('[data-testid="title-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="body-input"]')).toHaveValue('');
  });

  test('should add child node when save button is clicked', async ({ page }) => {
    // Select a node and open add form
    await page.locator('.node-group').first().click({ timeout: 500 });
    await page.waitForTimeout(100);
    await page.keyboard.press('Tab');
    
    // Fill in the form
    await page.locator('[data-testid="title-input"]').fill('New Child Node');
    await page.locator('[data-testid="body-input"]').fill('Child body content');
    
    // Count initial nodes
    const initialNodeCount = await page.locator('.node-group').count();
    
    // Save the new node
    await page.locator('[data-testid="save-button"]').click();
    
    // Wait for node to be created and selection to be maintained
    await page.waitForTimeout(500);
    
    // Check if new node was created
    const finalNodeCount = await page.locator('.node-group').count();
    expect(finalNodeCount).toBeGreaterThan(initialNodeCount);
    
    // Check if parent node is still selected (highlighted)
    const parentNode = page.locator('.node-group').last();
    await expect(parentNode.locator('circle')).toHaveCSS('fill', 'rgb(0, 255, 0)'); // Green color for selected
  });

  test('should add child node when tab is pressed with title content', async ({ page }) => {
    // Select a node and open add form
    await page.locator('.node-group').first().click({ timeout: 500 });
    await page.waitForTimeout(100);
    await page.keyboard.press('Tab');
    
    // Fill in title
    await page.locator('[data-testid="title-input"]').fill('Quick Child Node');
    
    // Count initial nodes
    const initialNodeCount = await page.locator('.node-group').count();
    
    // Press Tab to save and start new add
    await page.keyboard.press('Tab');
    
    // Wait for first node to be created
    await page.waitForTimeout(500);
    
    // Check if new node was created
    const afterFirstTabCount = await page.locator('.node-group').count();
    expect(afterFirstTabCount).toBe(initialNodeCount + 1);
    
    // Check if form is reset for next node
    await expect(page.locator('[data-testid="title-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="body-input"]')).toHaveValue('');
    
    // Add another node quickly
    await page.locator('[data-testid="title-input"]').fill('Second Quick Child');
    await page.keyboard.press('Tab');
    
    // Wait for second node to be created
    await page.waitForTimeout(500);
    
    // Check if second node was created
    const finalNodeCount = await page.locator('.node-group').count();
    expect(finalNodeCount).toBe(initialNodeCount + 2);
  });

  test('should not add node when tab is pressed with empty title', async ({ page }) => {
    // Select a node and open add form
    await page.locator('.node-group').first().click({ timeout: 500 });
    await page.waitForTimeout(100);
    await page.keyboard.press('Tab');
    
    // Count initial nodes
    const initialNodeCount = await page.locator('.node-group').count();
    
    // Press Tab with empty title
    await page.keyboard.press('Tab');
    
    // Wait a bit to ensure no async operations
    await page.waitForTimeout(500);
    
    // Check if no new node was created
    const finalNodeCount = await page.locator('.node-group').count();
    expect(finalNodeCount).toBe(initialNodeCount);
    
    // Check if form is still in add mode
    await expect(page.locator('[data-testid="title-input"]')).toHaveAttribute('placeholder', 'Edit title');
  });

  test('should cancel add and return to edit mode when title is empty on save', async ({ page }) => {
    // Select a node and open add form
    await page.locator('.node-group').first().click({ timeout: 500 });
    await page.waitForTimeout(100);
    await page.keyboard.press('Tab');
    
    // Count initial nodes (should not change)
    const initialNodeCount = await page.locator('.node-group').count();
    
    // Save with empty title (should cancel and go to edit mode)
    await page.locator('[data-testid="save-button"]').click();
    
    // Wait for mode to change
    await page.waitForTimeout(500);
    
    // Check if no new node was created
    const finalNodeCount = await page.locator('.node-group').count();
    expect(finalNodeCount).toBe(initialNodeCount);
    
    // Check if form is now in edit mode with selected node's data
    await expect(page.locator('[data-testid="title-input"]')).toHaveAttribute('placeholder', 'Edit title');
    await expect(page.locator('[data-testid="body-input"]')).toHaveAttribute('placeholder', 'Edit body');
    
    // Should contain the selected node's data (Root Node)
    const titleValue = await page.locator('[data-testid="title-input"]').inputValue();
    expect(titleValue).toBe('Root');
  });

  test('should maintain parent selection after adding child', async ({ page }) => {
    // Select a node
    await page.locator('.node-group').last().click({ timeout: 500 });
    await page.waitForTimeout(100);
    
    // Verify parent is initially selected
    let parentNode = page.locator('.node-group').last();
    await expect(parentNode.locator('circle')).toHaveCSS('fill', 'rgb(0, 255, 0)');
    
    // Add child node
    await page.keyboard.press('Tab');
    await page.locator('[data-testid="title-input"]').fill('Child Node');
    await page.locator('[data-testid="save-button"]').click();
    
    // Wait for child to be created
    await page.waitForTimeout(500);
    
    // Verify parent is still selected after adding child
    parentNode = page.locator('.node-group').last();
    await expect(parentNode.locator('circle')).toHaveCSS('fill', 'rgb(0, 255, 0)');
    
    // Verify child is not selected
    const childNodes = await page.locator('.node-group').all();
    const childNode = childNodes[childNodes.length - 1]; // Last node (new child)
    await expect(childNode.locator('circle')).not.toHaveCSS('fill', 'rgb(255, 255, 255)');
  });

  test('should not work when no node is selected', async ({ page }) => {
    // Don't select any node, just press Tab
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    // Check that node-input is not visible (no form opened)
    await expect(page.locator('[data-testid="node-input"]')).not.toBeVisible();
    
    // Check that no new nodes were created
    const nodeCount = await page.locator('.node-group').count();
    expect(nodeCount).toBeGreaterThan(0); // Should have initial nodes but no new ones
  });
});
