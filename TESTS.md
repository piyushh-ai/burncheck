# Tests

## How to Run All Tests

```bash
cd backend
npm test
```

## Test List

### 1. Budget filter works correctly
**File:** `tests/auditEngine.test.js`
**Covers:** Plans exceeding user's monthly budget should be filtered out.
**Input:** `{ teamSize: 2, monthlyBudget: 50, useCase: "coding", needsAPI: false }`
**Expected:** No plan with `monthlyCost > 50`. Cursor Business (2×$40=$80) should NOT appear.
**Run:** `npm test -- --test-name-pattern="budget"`

### 2. Per-seat pricing calculates correctly
**File:** `tests/auditEngine.test.js`
**Covers:** Per-seat plans should calculate `pricePerSeat × teamSize`.
**Input:** `{ teamSize: 5, monthlyBudget: 500, useCase: "coding", needsAPI: false }`
**Expected:** Copilot Business = 5×$19 = $95. Cursor Business = 5×$40 = $200.
**Run:** `npm test -- --test-name-pattern="per-seat"`

### 3. Free tier gets bonus score
**File:** `tests/auditEngine.test.js`
**Covers:** Plans with `pricePerSeat: 0` should get a score bonus.
**Input:** `{ teamSize: 1, monthlyBudget: 0, useCase: "coding", needsAPI: false }`
**Expected:** Only free plans returned. All have `monthlyCost = 0`.
**Run:** `npm test -- --test-name-pattern="free"`

### 4. Returns maximum 5 results
**File:** `tests/auditEngine.test.js`
**Covers:** Engine should always return at most 5 recommendations.
**Input:** `{ teamSize: 1, monthlyBudget: 1000, useCase: "mixed", needsAPI: false }`
**Expected:** `results.length <= 5`
**Run:** `npm test -- --test-name-pattern="max results"`

### 5. API need boosts token-based plans
**File:** `tests/auditEngine.test.js`
**Covers:** When `needsAPI: true`, token-based plans should rank higher.
**Input:** `{ teamSize: 1, monthlyBudget: 200, useCase: "coding", needsAPI: true }`
**Expected:** At least one API plan in top 5 results.
**Run:** `npm test -- --test-name-pattern="API"`

### 6. Pricing validation
**File:** `tests/pricingValidation.test.js`
**Covers:** All prices in `pricingData.js` match official sources.
**Run:** `npm test -- --test-name-pattern="pricing"`

### 7. Zero team size edge case
**File:** `tests/auditEngine.test.js`
**Covers:** Team size 0 or 1 — no errors, per-seat plans cost $0 or 1× price.
**Run:** `npm test -- --test-name-pattern="edge"`
