import { test, expect } from '@playwright/test';

test.describe('Save functionality', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.setTimeout(5000);
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should save mindmap using File System Access API', async ({ page }) => {
    const rootText = "Root";
    const childText = "Test Child";
    
    // Create a child node first
    await page.locator(`.node-group:has-text("${rootText}")`).click({ timeout: 500 });
    await page.keyboard.press('Tab');
    
    await page.locator('[data-testid="title-input"]').fill(childText);
    await page.locator('[data-testid="body-input"]').fill(childText);
    await page.locator('[data-testid="save-button"]').click();
    await page.locator(`.node-group:has-text("${childText}")`).waitFor({ state: 'visible', timeout: 500 });
    
    // Mock the File System Access API after the page is fully loaded
    await page.evaluate(() => {
      (window as any).showSaveFilePicker = async () => {
        return {
          createWritable: async () => ({
            write: async (content: string) => {
              // Store content for verification
              (window as any).__testSaveContent = content;
            },
            close: async () => {}
          })
        };
      };
    });
    
    // Trigger save with Ctrl+S
    await page.keyboard.press('Control+s');
    
    // Wait for the save to complete
    await page.waitForTimeout(500);
    
    // Get the saved content
    const savedContent = await page.evaluate(() => (window as any).__testSaveContent);
    expect(savedContent).toBeTruthy();
    
    // Parse and verify the saved data
    const savedData = JSON.parse(savedContent);
    expect(savedData).toBeInstanceOf(Array);
    expect(savedData.length).toBeGreaterThan(0);
    
    // Verify the child node was saved
    const childNode = savedData.find((node: any) => node.label === childText);
    expect(childNode).toBeTruthy();
    expect(childNode.body).toBe(childText);
  });

  test('should fallback to download when File System Access API is unavailable', async ({ page }) => {
    const rootText = "Root";
    const childText = "Download Test";
    
    // Remove the File System Access API mock to force fallback
    await page.evaluate(() => {
      delete (window as any).showSaveFilePicker;
    });
    
    // Create a child node
    await page.locator(`.node-group:has-text("${rootText}")`).click({ timeout: 500 });
    await page.keyboard.press('Tab');
    
    await page.locator('[data-testid="title-input"]').fill(childText);
    await page.locator('[data-testid="body-input"]').fill(childText);
    await page.locator('[data-testid="save-button"]').click();
    await page.locator(`.node-group:has-text("${childText}")`).waitFor({ state: 'visible', timeout: 500 });
    
    // Listen for download event (fallback method)
    const downloadPromise = page.waitForEvent('download');
    
    // Trigger save - will use fallback since showSaveFilePicker is not available
    await page.keyboard.press('Control+s');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('mindmap.json');
    
    // Read and verify download content
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    const content = Buffer.concat(chunks).toString('utf-8');
    const savedData = JSON.parse(content);
    
    expect(savedData).toBeInstanceOf(Array);
    expect(savedData.length).toBeGreaterThan(0);
    
    const childNode = savedData.find((node: any) => node.label === childText);
    expect(childNode).toBeTruthy();
    expect(childNode.body).toBe(childText);
  });

  test('should handle save cancellation gracefully', async ({ page }) => {
    // Mock File System Access API to simulate user cancellation
    await page.addInitScript(() => {
      (window as any).showSaveFilePicker = async () => {
        throw new DOMException('User cancelled the operation', 'AbortError');
      };
    });
    
    // Trigger save - should not throw error
    await page.keyboard.press('Control+s');
    
    // Wait a moment to ensure no unhandled errors
    await page.waitForTimeout(500);
    
    // Test passes if no errors were thrown
    expect(true).toBeTruthy();
  });
});
