# E2E Tests with Playwright

This directory contains end-to-end tests for Mind Map application using Playwright with Docker support.

## Setup

Playwright is already installed and configured. The browsers are downloaded automatically.

## Running Tests

### Local Development

#### Run all tests (requires app running on localhost:3000)
```bash
npm run test:e2e
```

#### Run tests in UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

#### Run tests in debug mode
```bash
npm run test:e2e:debug
```

#### Generate tests with Codegen
```bash
npm run test:e2e:codegen
```

### Dockerized Testing

#### Run tests in Docker containers (recommended for CI/CD)
```bash
npm run test:e2e:docker
```

#### Run UI mode in Docker
```bash
npm run test:e2e:docker-ui
```

#### Clean up Docker containers
```bash
npm run test:e2e:docker-clean
```

### Advanced Usage

#### Run specific test file
```bash
npx playwright test mind-map.spec.ts
```

#### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Docker Architecture

The Docker setup includes:
- **app service**: Runs your mind map application
- **e2e-tests service**: Runs Playwright tests against the app
- **e2e-tests-ui service**: Runs Playwright UI mode for debugging
- **Health checks**: Ensures app is ready before tests run
- **Volume mounts**: Shares test results with host machine

## Test Files

- `mind-map.spec.ts` - Core mind map functionality tests

## Writing New Tests

1. Use TypeScript for type safety
2. Follow existing test structure
3. Use descriptive test names
4. Add proper assertions with `expect()`
5. Use `data-testid` attributes for better element selection
6. Test against Docker environment for consistency

## Best Practices

- Use `page.waitForLoadState('networkidle')` for page loads
- Use `page.waitForTimeout()` sparingly for animations
- Prefer `data-testid` over CSS selectors
- Group related tests with `test.describe()`
- Use `test.beforeEach()` for common setup
- Test in Docker to match CI/CD environment

## Debugging

- Use UI mode to see tests run in real-time
- Use debug mode to step through tests
- Use trace viewer for failed tests: `npx playwright show-report`
- Use VS Code Playwright extension for better debugging experience
- Check Docker logs: `docker-compose -f docker-compose.test.yml logs e2e-tests`

## CI/CD Integration

Tests automatically run on:
- Push to main/master branches
- Pull requests to main/master branches
- Manual workflow dispatch

Results are uploaded as GitHub artifacts for 30 days.
