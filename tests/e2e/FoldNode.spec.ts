import { test, expect, Page, Locator } from '@playwright/test';

test.describe('Fold Node E2E Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.setTimeout(5000);
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should toggle fold/unfold on clicking node with children', async ({ page }) => {
    const rootText = "Root";
    const rootNode = page.locator(`.node-group:has-text("${rootText}")`);
    await rootNode.click();
    
    for (let i = 1; i <= 3; i++) {
      const childText = `Child ${i}`;
      await page.keyboard.press('Tab');
      await page.locator('[data-testid="title-input"]').fill(childText);
      await page.locator('[data-testid="body-input"]').fill(childText);
      await page.locator('[data-testid="save-button"]').click();
      
      await page.locator(`.node-group:has-text("${childText}")`).waitFor({ state: 'visible', timeout: 2000 });
    }

    await rootNode.locator('circle').click();
    for (let i = 1; i <= 3; i++) {
      const childText = `Child ${i}`;
      const childNode = page.locator(`.node-group:has-text("${childText}")`);
      await expect(childNode).not.toBeVisible();
    }

    await rootNode.locator('circle').click();
    for (let i = 1; i <= 3; i++) {
      const childText = `Child ${i}`;
      const childNode = page.locator(`.node-group:has-text("${childText}")`);
      await expect(childNode).toBeVisible();
    }
  });

  test.only('should handle nested fold/unfold correctly', async ({ page }) => {
    const rootNode = await selectRoot(page);
    await rootNode.click();
    await createRootChildren(page);

    const child1Node = await selectChild1(page);
    await child1Node.click();
    await createSubchildren(page);

    await child1Node.locator('circle').click();
    await assertSubchildrenHidden(page);
    await assertChild1AndSiblingsVisible(child1Node, page);

    await rootNode.locator('circle').click();
    await assertAllHiddenExceptRoot(child1Node, rootNode, page);
    
    await rootNode.locator('circle').click();
    await assertAllVisibleChild1Folded(child1Node, page);

    await child1Node.locator('circle').click();
    await assertChild1ChildrenVisible(page)
  });
});


async function selectRoot(page: Page): Promise<Locator> {
  const rootText = "Root";
  const rootNode = page.locator(`.node-group:has-text("${rootText}")`);
  return rootNode;
}

async function createRootChildren(page: Page): Promise<void> {
  for (let i = 1; i <= 3; i++) {
    const childText = `Child ${i}`;
    await page.keyboard.press('Tab');
    await page.locator('[data-testid="title-input"]').fill(childText);
    await page.locator('[data-testid="body-input"]').fill(childText);
    await page.locator('[data-testid="save-button"]').click();
    await page.locator(`.node-group:has-text("${childText}")`).waitFor({ state: 'visible', timeout: 2000 });
  }
}

async function selectChild1(page: Page): Promise<Locator> {
  const child1Text = "Child 1";
  const child1Node = page.locator('g.node-group')
    .filter({ has: page.locator(`text="${child1Text}"`) });
  return child1Node;
}

async function createSubchildren(page: Page): Promise<void> {
  for (let i = 1; i <= 3; i++) {
    const subChildText = `Child 1-${i}`;
    await page.keyboard.press('Tab');
    await page.locator('[data-testid="title-input"]').fill(subChildText);
    await page.locator('[data-testid="body-input"]').fill(subChildText);
    await page.locator('[data-testid="save-button"]').click();
    await page.locator(`.node-group:has-text("${subChildText}")`).waitFor({ state: 'visible', timeout: 2000 });
  }
}

async function assertSubchildrenHidden(page: Page): Promise<void> {
  for (let i = 1; i <= 3; i++) {
    const subChildText = `Child 1-${i}`;
    const subChildNode = page.locator('g.node-group').filter({ has: page.locator(`text="${subChildText}"`) });
    await expect(subChildNode).not.toBeVisible();
  }
}

async function assertChild1AndSiblingsVisible(child1Node: Locator, page: Page): Promise<void> {
  await expect(child1Node).toBeVisible();
  for (let i = 2; i <= 3; i++) {
    const childText = `Child ${i}`;
    const childNode = page.locator('g.node-group').filter({ has: page.locator(`text="${childText}"`) });
    await expect(childNode).toBeVisible();
  }
}

async function assertAllHiddenExceptRoot(child1Node: Locator, rootNode: Locator, page: Page): Promise<void> {
  await expect(rootNode).toBeVisible();
  await expect(child1Node).not.toBeVisible();
  for (let i = 2; i <= 3; i++) {
    const childText = `Child ${i}`;
    const childNode = page.locator(`.node-group:has-text("${childText}")`);
    await expect(childNode).not.toBeVisible();
  }
  await assertSubchildrenHidden(page);
}

async function assertAllVisibleChild1Folded(child1Node: Locator, page: Page): Promise<void> {
  await expect(child1Node).toBeVisible();
  await expect(child1Node.locator('circle')).toHaveCSS('fill', 'rgb(0, 0, 255)'); // blue
  for (let i = 2; i <= 3; i++) {
    const childText = `Child ${i}`;
    const childNode = page.locator(`.node-group:has-text("${childText}")`);
    await expect(childNode).toBeVisible();
  }
  await assertSubchildrenHidden(page);
}

async function assertChild1ChildrenVisible(page: Page): Promise<void> {
  for (let i = 1; i <= 3; i++) {
    const subChildText = `Child 1-${i}`;
    const subChildNode = page.locator('g.node-group').filter({ has: page.locator(`text="${subChildText}"`) });
    await expect(subChildNode).toBeVisible();
  }
}
