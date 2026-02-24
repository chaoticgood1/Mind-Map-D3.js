import { test, expect } from '@playwright/test';

test.describe('Open functionality', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.setTimeout(5000);
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should open mindmap using File System Access API', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).showOpenFilePicker = async () => {
        return [{
          getFile: async () => ({
            text: async () => JSON.stringify([
              { id: '1', label: 'Loaded Root', body: 'Root content', childrenIds: ['2', '3'] },
              { id: '2', label: 'Loaded Child 1', body: 'Child 1 content', childrenIds: [] },
              { id: '3', label: 'Loaded Child 2', body: 'Child 2 content', childrenIds: ['4'] },
              { id: '4', label: 'Loaded Grandchild', body: 'Grandchild content', childrenIds: [] }
            ])
          })
        }];
      };
    });

    // Prevent default browser behavior and trigger our openFile function directly
    await page.evaluate(() => {
      const event = new KeyboardEvent('keydown', { 
        key: 'o', 
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
    });

    await page.waitForFunction(() => {
      const nodes = document.querySelectorAll('.node-group');
      return nodes.length >= 4;
    }, { timeout: 500 });

    await expect(page.locator('.node-group:has-text("Loaded Root")')).toBeVisible();
    await expect(page.locator('.node-group:has-text("Loaded Child 1")')).toBeVisible();
    await expect(page.locator('.node-group:has-text("Loaded Child 2")')).toBeVisible();
    await expect(page.locator('.node-group:has-text("Loaded Grandchild")')).toBeVisible();
  });

  test('should open hierarchical tree format', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).showOpenFilePicker = async () => {
        return [{
          getFile: async () => ({
            text: async () => JSON.stringify({
              label: 'Tree Root',
              body: 'Root description',
              children: [
                {
                  label: 'Branch 1',
                  body: 'Branch 1 description',
                  children: [
                    { label: 'Leaf 1', body: 'Leaf 1 description' }
                  ]
                },
                {
                  label: 'Branch 2',
                  body: 'Branch 2 description'
                }
              ]
            })
          })
        }];
      };
    });

    // Prevent default browser behavior and trigger our openFile function directly
    await page.evaluate(() => {
      const event = new KeyboardEvent('keydown', { 
        key: 'o', 
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
    });

    await page.waitForFunction(() => {
      const nodes = document.querySelectorAll('.node-group');
      return nodes.length >= 4;
    }, { timeout: 500 });

    await expect(page.locator('.node-group:has-text("Tree Root")')).toBeVisible();
    await expect(page.locator('.node-group:has-text("Branch 1")')).toBeVisible();
    await expect(page.locator('.node-group:has-text("Branch 2")')).toBeVisible();
    await expect(page.locator('.node-group:has-text("Leaf 1")')).toBeVisible();
  });

  test('should handle invalid JSON gracefully', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).showOpenFilePicker = async () => {
        return [{
          getFile: async () => ({
            text: async () => 'invalid json content'
          })
        }];
      };
    });

    const initialNodeCount = await page.locator('.node-group').count();

    // Prevent default browser behavior and trigger our openFile function directly
    await page.evaluate(() => {
      const event = new KeyboardEvent('keydown', { 
        key: 'o', 
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
    });

    await page.waitForLoadState('networkidle');

    const finalNodeCount = await page.locator('.node-group').count();
    expect(finalNodeCount).toBe(initialNodeCount);
  });

  test('should handle file open cancellation gracefully', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).showOpenFilePicker = async () => {
        throw new DOMException('User cancelled the operation', 'AbortError');
      };
    });

    const initialNodeCount = await page.locator('.node-group').count();

    // Prevent default browser behavior and trigger our openFile function directly
    await page.evaluate(() => {
      const event = new KeyboardEvent('keydown', { 
        key: 'o', 
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
    });

    await page.waitForLoadState('networkidle');

    const finalNodeCount = await page.locator('.node-group').count();
    expect(finalNodeCount).toBe(initialNodeCount);
  });

  test('should handle empty data gracefully', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).showOpenFilePicker = async () => {
        return [{
          getFile: async () => ({
            text: async () => JSON.stringify([])
          })
        }];
      };
    });

    const initialNodeCount = await page.locator('.node-group').count();

    // Prevent default browser behavior and trigger our openFile function directly
    await page.evaluate(() => {
      const event = new KeyboardEvent('keydown', { 
        key: 'o', 
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
    });

    await page.waitForLoadState('networkidle');

    const finalNodeCount = await page.locator('.node-group').count();
    expect(finalNodeCount).toBe(initialNodeCount);
  });
});
