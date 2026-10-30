/**
 * Commission calculation unit tests.
 *
 * Covers the core commission logic: rate-based calculation,
 * min/max bounds, edge cases, and currency formatting.
 */

import { describe, it, expect } from "vitest";
import {
  calculateCommission,
  formatCurrency,
  type CommissionPolicySnapshot,
} from "@/lib/commission";

describe("calculateCommission", () => {
  const basePolicy: CommissionPolicySnapshot = {
    ratePercent: 10,
    minAmountPaise: null,
    maxAmountPaise: null,
  };

  it("calculates 10% commission on ₹1,000 (100000 paise)", () => {
    const result = calculateCommission(100000, basePolicy);
    expect(result.commissionAmountPaise).toBe(10000);
    expect(result.ownerSharePaise).toBe(90000);
    expect(result.grossAmountPaise).toBe(100000);
    expect(result.commissionRatePercent).toBe(10);
    expect(result.currency).toBe("INR");
  });

  it("calculates commission for small amounts correctly", () => {
    const result = calculateCommission(150, basePolicy);
    expect(result.commissionAmountPaise).toBe(15);
    expect(result.ownerSharePaise).toBe(135);
  });

  it("rounds to nearest paise for fractional results", () => {
    // 333 * 10 / 100 = 33.3 → rounds to 33
    const result = calculateCommission(333, basePolicy);
    expect(result.commissionAmountPaise).toBe(33);
    expect(result.ownerSharePaise).toBe(300);
  });

  it("handles zero amount", () => {
    const result = calculateCommission(0, basePolicy);
    expect(result.commissionAmountPaise).toBe(0);
    expect(result.ownerSharePaise).toBe(0);
  });

  it("handles 0% commission rate", () => {
    const zeroRate: CommissionPolicySnapshot = {
      ratePercent: 0,
      minAmountPaise: null,
      maxAmountPaise: null,
    };
    const result = calculateCommission(100000, zeroRate);
    expect(result.commissionAmountPaise).toBe(0);
    expect(result.ownerSharePaise).toBe(100000);
  });

  it("handles 100% commission rate", () => {
    const fullRate: CommissionPolicySnapshot = {
      ratePercent: 100,
      minAmountPaise: null,
      maxAmountPaise: null,
    };
    const result = calculateCommission(100000, fullRate);
    expect(result.commissionAmountPaise).toBe(100000);
    expect(result.ownerSharePaise).toBe(0);
  });

  it("applies minimum commission bound", () => {
    const policy: CommissionPolicySnapshot = {
      ratePercent: 10,
      minAmountPaise: 500, // ₹5 minimum
      maxAmountPaise: null,
    };
    // 10% of ₹10 = ₹1 (100 paise), but min is 500
    const result = calculateCommission(1000, policy);
    expect(result.commissionAmountPaise).toBe(500);
    expect(result.ownerSharePaise).toBe(500);
  });

  it("applies maximum commission bound", () => {
    const policy: CommissionPolicySnapshot = {
      ratePercent: 10,
      minAmountPaise: null,
      maxAmountPaise: 5000, // ₹50 maximum
    };
    // 10% of ₹10,000 = ₹1,000, but max is ₹50
    const result = calculateCommission(1000000, policy);
    expect(result.commissionAmountPaise).toBe(5000);
    expect(result.ownerSharePaise).toBe(995000);
  });

  it("commission cannot exceed gross amount when min is applied", () => {
    const policy: CommissionPolicySnapshot = {
      ratePercent: 10,
      minAmountPaise: 10000, // ₹100 minimum
      maxAmountPaise: null,
    };
    // Amount is only ₹50, min commission is ₹100 — capped to ₹50
    const result = calculateCommission(5000, policy);
    expect(result.commissionAmountPaise).toBe(5000);
    expect(result.ownerSharePaise).toBe(0);
  });

  it("throws on negative gross amount", () => {
    expect(() => calculateCommission(-100, basePolicy)).toThrow(
      "Gross amount cannot be negative"
    );
  });

  it("throws on negative commission rate", () => {
    const badPolicy: CommissionPolicySnapshot = {
      ratePercent: -5,
      minAmountPaise: null,
      maxAmountPaise: null,
    };
    expect(() => calculateCommission(100000, badPolicy)).toThrow(
      "Commission rate must be between 0 and 100"
    );
  });

  it("throws on commission rate > 100", () => {
    const badPolicy: CommissionPolicySnapshot = {
      ratePercent: 150,
      minAmountPaise: null,
      maxAmountPaise: null,
    };
    expect(() => calculateCommission(100000, badPolicy)).toThrow(
      "Commission rate must be between 0 and 100"
    );
  });

  it("passes through the correct currency", () => {
    const result = calculateCommission(100000, basePolicy, "USD");
    expect(result.currency).toBe("USD");
  });

  it("uses integer math — no floating-point drift", () => {
    // Classic floating point problem: 0.1 + 0.2 !== 0.3
    // With paise-based math this shouldn't be an issue
    const policy: CommissionPolicySnapshot = {
      ratePercent: 33.33,
      minAmountPaise: null,
      maxAmountPaise: null,
    };
    const result = calculateCommission(100000, policy);
    // 100000 * 33.33 / 100 = 33330
    expect(result.commissionAmountPaise).toBe(33330);
    expect(result.ownerSharePaise).toBe(66670);
    expect(result.commissionAmountPaise + result.ownerSharePaise).toBe(100000);
  });
});

describe("formatCurrency", () => {
  it("formats paise to INR string", () => {
    const result = formatCurrency(100000);
    // Should contain ₹1,000.00 (format may vary by locale)
    expect(result).toContain("1,000");
    expect(result).toContain("₹");
  });

  it("formats zero amount", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0.00");
  });

  it("formats fractional rupees", () => {
    const result = formatCurrency(1050);
    expect(result).toContain("10.50");
  });

  it("formats large amounts", () => {
    const result = formatCurrency(10000000); // ₹1,00,000
    // Indian numbering system uses lakhs
    expect(result).toContain("1,00,000");
  });
});
