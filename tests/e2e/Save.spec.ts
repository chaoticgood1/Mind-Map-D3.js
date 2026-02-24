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
    
    await page.locator(`.node-group:has-text("${rootText}")`).click({ timeout: 500 });
    await page.keyboard.press('Tab');
    
    await page.locator('[data-testid="title-input"]').fill(childText);
    await page.locator('[data-testid="body-input"]').fill(childText);
    await page.locator('[data-testid="save-button"]').click();
    await page.locator(`.node-group:has-text("${childText}")`).waitFor({ state: 'visible', timeout: 500 });
    
    await page.evaluate(() => {
      (window as any).showSaveFilePicker = async () => {
        return {
          createWritable: async () => ({
            write: async (content: string) => {
              (window as any).__testSaveContent = content;
            },
            close: async () => {}
          })
        };
      };
    });
    
    // Prevent default browser behavior and trigger our saveToFile function directly
    await page.evaluate(() => {
      const event = new KeyboardEvent('keydown', { 
        key: 's', 
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
    });
    
    await page.waitForFunction(() => (window as any).__testSaveContent !== undefined, {
      timeout: 5000
    });
    
    const savedContent = await page.evaluate(() => (window as any).__testSaveContent);
    expect(savedContent).toBeTruthy();
    
    const savedData = JSON.parse(savedContent);
    expect(savedData).toBeInstanceOf(Array);
    expect(savedData.length).toBeGreaterThan(0);
    
    const childNode = savedData.find((node: any) => node.label === childText);
    expect(childNode).toBeTruthy();
    expect(childNode.body).toBe(childText);
  });

  test('should fallback to download when File System Access API is unavailable', async ({ page }) => {
    const rootText = "Root";
    const childText = "Download Test";
    
    await page.locator(`.node-group:has-text("${rootText}")`).click({ timeout: 500 });
    await page.keyboard.press('Tab');
    
    await page.locator('[data-testid="title-input"]').fill(childText);
    await page.locator('[data-testid="body-input"]').fill(childText);
    await page.locator('[data-testid="save-button"]').click();
    await page.locator(`.node-group:has-text("${childText}")`).waitFor({ state: 'visible', timeout: 500 });
    
    await page.evaluate(() => {
      delete (window as any).showSaveFilePicker;
    });
    
    // Prevent default browser behavior and trigger our saveToFile function directly
    await page.evaluate(() => {
      const event = new KeyboardEvent('keydown', { 
        key: 's', 
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
    });
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.waitForLoadState('networkidle')
    ]);
    
    expect(download.suggestedFilename()).toBe('mindmap.json');
    
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
    await page.addInitScript(() => {
      (window as any).showSaveFilePicker = async () => {
        throw new DOMException('User cancelled the operation', 'AbortError');
      };
    });
    
    // Prevent default browser behavior and trigger our saveToFile function directly
    await page.evaluate(() => {
      const event = new KeyboardEvent('keydown', { 
        key: 's', 
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
    });
    
    await page.waitForLoadState('networkidle');
    
    // Should not crash and page should remain stable
    await expect(page.locator('.node-group')).toHaveCount(1);
  });
});
