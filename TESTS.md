# Tests

## How to Run All Tests

```bash
cd backend
npm test
```

**Result:** 14/14 tests pass. ✅

```
▶ Audit Engine
  ✔ should filter out plans exceeding budget
  ✔ should calculate per-seat pricing correctly
  ✔ should return only free plans when budget is 0
  ✔ should return maximum 5 results
  ✔ should boost API plans when needsAPI is true
  ✔ should handle edge case of team size 0
  ✔ should return results sorted by score descending
✔ Audit Engine (3ms)

▶ Pricing Validation
  ✔ should have correct Cursor pricing
  ✔ should have correct GitHub Copilot pricing
  ✔ should have correct Claude pricing
  ✔ should have correct ChatGPT pricing
  ✔ should have correct Windsurf pricing
  ✔ should have verified dates for all tools
  ✔ should have website URLs for all tools
✔ Pricing Validation (3ms)

tests: 14 | pass: 14 | fail: 0
```

---

## Test Files

### `tests/auditEngine.test.js`

7 tests covering the core audit scoring logic.

#### 1. Budget filter works correctly
**Covers:** Plans exceeding user's monthly budget should be filtered out.  
**Input:** `{ teamSize: 2, monthlyBudget: 50, useCase: "coding", needsAPI: false }`  
**Expected:** No plan with `monthlyCost > 50`. Cursor Business (2×$40=$80) should NOT appear.  
**Run:** `node --test tests/auditEngine.test.js --test-name-pattern="budget"`

#### 2. Per-seat pricing calculates correctly
**Covers:** Per-seat plans should calculate `pricePerSeat × teamSize`.  
**Input:** `{ teamSize: 5, monthlyBudget: 500, useCase: "coding", needsAPI: false }`  
**Expected:** Copilot Business = 5×$19 = $95.  
**Run:** `node --test tests/auditEngine.test.js --test-name-pattern="per-seat"`

#### 3. Free tier included when budget is 0
**Covers:** Plans with `pricePerSeat: 0` should always be included.  
**Input:** `{ teamSize: 1, monthlyBudget: 0, useCase: "coding", needsAPI: false }`  
**Expected:** At least one free plan returned.  
**Run:** `node --test tests/auditEngine.test.js --test-name-pattern="free"`

#### 4. Returns maximum 5 results
**Covers:** Engine should always return at most 5 recommendations.  
**Input:** `{ teamSize: 1, monthlyBudget: 1000, useCase: "mixed", needsAPI: false }`  
**Expected:** `results.length <= 5`  
**Run:** `node --test tests/auditEngine.test.js --test-name-pattern="max"`

#### 5. API need boosts API-category plans
**Covers:** When `needsAPI: true`, API-category tools should rank higher than when false.  
**Input:** `{ teamSize: 1, monthlyBudget: 200, useCase: "coding", needsAPI: true }`  
**Expected:** Results differ between `needsAPI: true` and `needsAPI: false`.  
**Run:** `node --test tests/auditEngine.test.js --test-name-pattern="API"`

#### 6. Zero team size edge case
**Covers:** Team size 0 should not crash — treated as team of 1.  
**Expected:** No errors thrown. All costs >= $0.  
**Run:** `node --test tests/auditEngine.test.js --test-name-pattern="edge"`

#### 7. Results sorted by score descending
**Covers:** Higher-scored recommendations should appear before lower-scored ones.  
**Expected:** `results[i-1].score >= results[i].score` for all consecutive pairs.  
**Run:** `node --test tests/auditEngine.test.js --test-name-pattern="sorted"`

---

### `tests/pricingValidation.test.js`

7 tests validating that pricing data matches official sources.

#### 8. Cursor pricing correct
**Covers:** Hobby=$0, Pro=$20, Business=$40/seat.

#### 9. GitHub Copilot pricing correct
**Covers:** Free=$0, Pro=$10, Business=$19/seat, Enterprise=$39/seat.

#### 10. Claude pricing correct
**Covers:** Free=$0, Pro=$20, Max=$100, Team=$30/seat.

#### 11. ChatGPT pricing correct
**Covers:** Free=$0, Plus=$20, Team=$30/seat.

#### 12. Windsurf pricing correct
**Covers:** Free=$0, Pro=$20, Teams=$40/seat.

#### 13. All tools have verifiedDate
**Covers:** Every tool in pricingData must have a `verifiedDate` field.

#### 14. All tools have valid website URLs
**Covers:** Every tool must have a `website` field starting with `http`.

---

## CI/CD

Tests run automatically on every push to `main` via `.github/workflows/ci.yml`:

```yaml
- npm ci          (backend)
- npm run lint    (frontend)
- npm test        (backend — runs both test files)
```

GitHub Actions shows green ✅ on the latest commit.
