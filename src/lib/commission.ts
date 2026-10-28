/**
 * Commission calculation utility.
 *
 * All money values are in integer minor currency units (paise for INR).
 * Uses integer arithmetic to avoid floating-point precision issues.
 * Rounding is applied exactly once at the final calculation step.
 */

export interface CommissionCalculation {
  grossAmountPaise: number;
  commissionRatePercent: number;
  commissionAmountPaise: number;
  ownerSharePaise: number;
  currency: string;
}

export interface CommissionPolicySnapshot {
  ratePercent: number;
  minAmountPaise?: number | null;
  maxAmountPaise?: number | null;
}

/**
 * Calculate commission for a booking.
 *
 * @param grossAmountPaise - Total service amount in paise
 * @param policy - Commission policy snapshot
 * @param currency - Currency code (e.g., "INR")
 * @returns CommissionCalculation with all values in paise
 */
export function calculateCommission(
  grossAmountPaise: number,
  policy: CommissionPolicySnapshot,
  currency: string = "INR"
): CommissionCalculation {
  if (grossAmountPaise < 0) {
    throw new Error("Gross amount cannot be negative");
  }

  if (policy.ratePercent < 0 || policy.ratePercent > 100) {
    throw new Error("Commission rate must be between 0 and 100");
  }

  // Calculate raw commission using integer math
  // (grossAmount * rate) / 100, rounded to nearest paise
  let commissionAmountPaise = Math.round(
    (grossAmountPaise * policy.ratePercent) / 100
  );

  // Apply min/max bounds
  if (policy.minAmountPaise != null && commissionAmountPaise < policy.minAmountPaise) {
    commissionAmountPaise = policy.minAmountPaise;
  }
  if (policy.maxAmountPaise != null && commissionAmountPaise > policy.maxAmountPaise) {
    commissionAmountPaise = policy.maxAmountPaise;
  }

  // Commission cannot exceed gross amount
  commissionAmountPaise = Math.min(commissionAmountPaise, grossAmountPaise);

  const ownerSharePaise = grossAmountPaise - commissionAmountPaise;

  return {
    grossAmountPaise,
    commissionRatePercent: policy.ratePercent,
    commissionAmountPaise,
    ownerSharePaise,
    currency,
  };
}

/**
 * Format paise to a human-readable currency string.
 *
 * @param paise - Amount in minor currency units
 * @param currency - Currency code (e.g., "INR")
 * @returns Formatted string like "₹1,000.00"
 */
export function formatCurrency(paise: number, currency: string = "INR"): string {
  const major = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(major);
}
