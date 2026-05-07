// tests/pricingValidation.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import pricingData from "../src/data/pricingData.js";

describe("Pricing Validation", () => {
  it("should have correct Cursor pricing", () => {
    const cursor = pricingData.cursor;
    assert.equal(cursor.plans.hobby.pricePerSeat, 0, "Cursor Hobby should be free");
    assert.equal(cursor.plans.pro.pricePerSeat, 20, "Cursor Pro should be $20");
    assert.equal(cursor.plans.business.pricePerSeat, 40, "Cursor Business should be $40/seat");
  });

  it("should have correct GitHub Copilot pricing", () => {
    const copilot = pricingData.github_copilot;
    assert.equal(copilot.plans.free.pricePerSeat, 0, "Copilot Free should be $0");
    assert.equal(copilot.plans.pro.pricePerSeat, 10, "Copilot Pro should be $10");
    assert.equal(copilot.plans.business.pricePerSeat, 19, "Copilot Business should be $19/seat");
    assert.equal(copilot.plans.enterprise.pricePerSeat, 39, "Copilot Enterprise should be $39/seat");
  });

  it("should have correct Claude pricing", () => {
    const claude = pricingData.claude;
    assert.equal(claude.plans.free.pricePerSeat, 0, "Claude Free should be $0");
    assert.equal(claude.plans.pro.pricePerSeat, 20, "Claude Pro should be $20");
    assert.equal(claude.plans.max.pricePerSeat, 100, "Claude Max should be $100");
    assert.equal(claude.plans.team.pricePerSeat, 30, "Claude Team should be $30/seat");
  });

  it("should have correct ChatGPT pricing", () => {
    const chatgpt = pricingData.chatgpt;
    assert.equal(chatgpt.plans.free.pricePerSeat, 0, "ChatGPT Free should be $0");
    assert.equal(chatgpt.plans.plus.pricePerSeat, 20, "ChatGPT Plus should be $20");
    assert.equal(chatgpt.plans.team.pricePerSeat, 30, "ChatGPT Team should be $30/seat");
  });

  it("should have correct Windsurf pricing", () => {
    const windsurf = pricingData.windsurf;
    assert.equal(windsurf.plans.free.pricePerSeat, 0, "Windsurf Free should be $0");
    assert.equal(windsurf.plans.pro.pricePerSeat, 20, "Windsurf Pro should be $20");
    assert.equal(windsurf.plans.teams.pricePerSeat, 40, "Windsurf Teams should be $40/seat");
  });

  it("should have verified dates for all tools", () => {
    for (const [key, tool] of Object.entries(pricingData)) {
      assert.ok(
        tool.verifiedDate,
        `${tool.name} is missing a verifiedDate`
      );
    }
  });

  it("should have website URLs for all tools", () => {
    for (const [key, tool] of Object.entries(pricingData)) {
      assert.ok(
        tool.website && tool.website.startsWith("http"),
        `${tool.name} has invalid website URL: ${tool.website}`
      );
    }
  });
});
