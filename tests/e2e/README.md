# E2E Tests with Playwright

This directory contains end-to-end tests for the Mind Map application using Playwright.

## Setup

Playwright is already installed and configured. The browsers are downloaded automatically.

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Generate tests with Codegen
```bash
npm run test:e2e:codegen
```

### Run specific test file
```bash
npx playwright test mind-map.spec.ts
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Files

- `mind-map.spec.ts` - Core mind map functionality tests

## Writing New Tests

1. Use TypeScript for type safety
2. Follow the existing test structure
3. Use descriptive test names
4. Add proper assertions with `expect()`
5. Use `data-testid` attributes for better element selection

## Best Practices

- Use `page.waitForLoadState('networkidle')` for page loads
- Use `page.waitForTimeout()` sparingly for animations
- Prefer `data-testid` over CSS selectors
- Group related tests with `test.describe()`
- Use `test.beforeEach()` for common setup

## Debugging

- Use UI mode to see tests run in real-time
- Use debug mode to step through tests
- Use trace viewer for failed tests: `npx playwright show-report`
- Use VS Code Playwright extension for better debugging experience
