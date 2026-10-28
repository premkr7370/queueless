# QueueLess — Testing Guide

## Status: ✅ Phase 9 Complete

---

## Overview

QueueLess has a comprehensive testing suite:

| Type | Framework | Test Count | Location |
|------|-----------|------------|----------|
| Unit Tests | Vitest | 128 | `src/**/__tests__/` |
| E2E Tests | Playwright | 20+ | `e2e/` |

---

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm test

# Run in watch mode (re-runs on file changes)
npm run test:watch

# Run with code coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Install browser engines (first time only)
npm run test:e2e:install

# Run all E2E tests
npm run test:e2e

# Run E2E tests with interactive UI
npm run test:e2e:ui
```

> **Note**: E2E tests require a running dev server. Playwright is configured to start one automatically if not already running.

---

## Unit Test Architecture

### Test Structure

```
src/
├── lib/
│   └── __tests__/
│       ├── commission.test.ts    # 18 tests — commission calculation
│       ├── rate-limit.test.ts    #  4 tests — rate limiter logic
│       └── validations.test.ts   # 50 tests — Zod schema validation
└── server/
    └── services/
        └── __tests__/
            ├── prisma.mock.ts    # Shared Prisma mock
            ├── booking.test.ts   # 18 tests — appointment service
            ├── queue.test.ts     # 15 tests — queue service
            ├── payment.test.ts   # 14 tests — payment & commission
            └── review.test.ts    #  9 tests — review service
```

### Prisma Mocking

Service tests use a shared mock (`prisma.mock.ts`) that stubs all Prisma model methods with `vi.fn()`. This allows:

- Testing business logic in isolation from the database
- Verifying correct Prisma calls without a running PostgreSQL
- Simulating error conditions and edge cases
- Fast test execution (~700ms for 128 tests)

### What's Tested

| Module | Tests Cover |
|--------|------------|
| **Commission** | Rate calculation, min/max bounds, integer arithmetic, zero/full rate, negative inputs, currency formatting |
| **Validations** | All Zod schemas (email, password, phone, slug, pincode, time, rating, currency, auth, business, service, appointment, queue, review, commission policy, pagination, search) |
| **Booking** | Appointment creation, conflict detection, business hours validation, break overlap, cancellation permissions, available slot generation |
| **Queue** | Token allocation, duplicate ticket prevention, queue status, call next, start serving, complete ticket, permission checks |
| **Payment** | Payment creation with commission snapshot, webhook idempotency, refund with negative ledger entries, commission summary |
| **Review** | Review creation with booking verification, duplicate prevention, business review aggregation, moderation |
| **Rate Limit** | Request counting, limit enforcement, identifier isolation, window reset |

---

## E2E Test Architecture

### Test Structure

```
e2e/
├── homepage.spec.ts   # Homepage rendering, nav, search, responsive
├── auth.spec.ts       # Login/register forms, validation, navigation
└── explore.spec.ts    # Search, filtering, categories, static pages, 404
```

### Browser Coverage

Playwright is configured for multi-browser testing:

| Browser | Device |
|---------|--------|
| Chromium | Desktop Chrome |
| Firefox | Desktop Firefox |
| WebKit | Desktop Safari |
| Mobile Chrome | Pixel 5 |

### What's Tested

| Page | Tests Cover |
|------|------------|
| **Homepage** | Page title, nav header, hero section, search bar, categories, How It Works, footer, search navigation, login link, about link, mobile menu |
| **Auth** | Login form display, empty submission validation, invalid credentials, register link, register form display, role selection, password validation, login link |
| **Explore** | Page rendering, search input, business cards/empty state, URL-synced search, category filters |
| **Categories** | Category-specific listings, business detail navigation |
| **Static Pages** | About, Contact, Privacy, Terms, Refund Policy, Business Terms (all load with < 400 status) |
| **404** | Unknown routes show not-found page |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Vitest configuration with path aliases |
| `playwright.config.ts` | Playwright multi-browser config with dev server auto-start |

---

## CI Integration

To run tests in CI (e.g., GitHub Actions):

```yaml
name: Tests
on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```
