# Testing Documentation

This document describes how to run and write tests for the LearnFlowAI project.

## Testing Stack

- **Unit Tests & Component Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright (Chromium only)
- **API Tests**: Supertest

## Running Tests

### Unit and Component Tests

```bash
# Run all unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Generate tests with Codegen
npm run test:e2e:codegen
```

## Writing Tests

### Unit Tests and Component Tests

- Place test files next to the component/function being tested
- Use `.test.ts` or `.test.tsx` extension
- Use React Testing Library for testing React components
- Follow AAA pattern (Arrange, Act, Assert)

Example:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders with the correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

### E2E Tests

- Place test files in the `tests` directory
- Use `.spec.ts` extension
- Follow Page Object Model pattern
- Create page objects in `tests/pages` directory

Example:

```ts
import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

test("navigation works correctly", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.expectTitleContains("LearnFlowAI");
});
```

### API Tests

- Place API test files next to the API endpoint files
- Use `.api.test.ts` extension
- Use `ApiTestHelper` for testing API endpoints

Example:

```ts
import { describe, it, expect } from "vitest";
import { ApiTestHelper } from "../../../test/apiTestHelper";

describe("API endpoints", () => {
  const api = new ApiTestHelper();

  it("should return valid data", async () => {
    const response = await api.get("/api/example");
    expect(response.body.success).toBe(true);
  });
});
```
