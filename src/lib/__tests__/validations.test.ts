/**
 * Zod validation schema unit tests.
 *
 * Verifies that all input validation schemas accept valid data
 * and reject invalid data with appropriate error messages.
 */

import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  slugSchema,
  pincodeSchema,
  timeSchema,
  ratingSchema,
  currencyAmountPaiseSchema,
  registerSchema,
  loginSchema,
  createBusinessSchema,
  createServiceSchema,
  createAppointmentSchema,
  joinQueueSchema,
  createReviewSchema,
  createCommissionPolicySchema,
  paginationSchema,
  searchBusinessesSchema,
} from "@/lib/validations";

// ──────────────────────────────────────────────
// Shared validators
// ──────────────────────────────────────────────

describe("emailSchema", () => {
  it("accepts valid emails", () => {
    expect(emailSchema.parse("user@example.com")).toBe("user@example.com");
    expect(emailSchema.parse("Test@EXAMPLE.com")).toBe("test@example.com");
  });

  it("rejects invalid emails", () => {
    expect(() => emailSchema.parse("")).toThrow();
    expect(() => emailSchema.parse("not-an-email")).toThrow();
    expect(() => emailSchema.parse("@no-local.com")).toThrow();
  });
});

describe("passwordSchema", () => {
  it("accepts valid passwords", () => {
    expect(passwordSchema.parse("12345678")).toBe("12345678");
    expect(passwordSchema.parse("a".repeat(128))).toHaveLength(128);
  });

  it("rejects short passwords", () => {
    expect(() => passwordSchema.parse("1234567")).toThrow();
  });

  it("rejects long passwords", () => {
    expect(() => passwordSchema.parse("a".repeat(129))).toThrow();
  });
});

describe("phoneSchema", () => {
  it("accepts valid phone numbers", () => {
    expect(phoneSchema.parse("+919876543210")).toBe("+919876543210");
    expect(phoneSchema.parse("9876543210")).toBe("9876543210");
  });

  it("accepts empty string (optional)", () => {
    expect(phoneSchema.parse("")).toBe("");
  });

  it("rejects invalid phone numbers", () => {
    expect(() => phoneSchema.parse("abc")).toThrow();
    expect(() => phoneSchema.parse("12345")).toThrow(); // too short
  });
});

describe("slugSchema", () => {
  it("accepts valid slugs", () => {
    expect(slugSchema.parse("my-business")).toBe("my-business");
    expect(slugSchema.parse("salon123")).toBe("salon123");
  });

  it("rejects invalid slugs", () => {
    expect(() => slugSchema.parse("My Business")).toThrow();
    expect(() => slugSchema.parse("CAPS")).toThrow();
    expect(() => slugSchema.parse("a")).toThrow(); // too short
  });
});

describe("pincodeSchema", () => {
  it("accepts valid pincodes", () => {
    expect(pincodeSchema.parse("560001")).toBe("560001");
    expect(pincodeSchema.parse("12345")).toBe("12345");
  });

  it("rejects invalid pincodes", () => {
    expect(() => pincodeSchema.parse("1234")).toThrow();
    expect(() => pincodeSchema.parse("abcdef")).toThrow();
  });
});

describe("timeSchema", () => {
  it("accepts valid HH:mm times", () => {
    expect(timeSchema.parse("09:00")).toBe("09:00");
    expect(timeSchema.parse("23:59")).toBe("23:59");
    expect(timeSchema.parse("00:00")).toBe("00:00");
  });

  it("rejects invalid times", () => {
    expect(() => timeSchema.parse("25:00")).toThrow();
    expect(() => timeSchema.parse("9:00")).toThrow(); // no leading zero
    expect(() => timeSchema.parse("09:60")).toThrow();
  });
});

describe("ratingSchema", () => {
  it("accepts ratings 1-5", () => {
    for (let i = 1; i <= 5; i++) {
      expect(ratingSchema.parse(i)).toBe(i);
    }
  });

  it("rejects out of range", () => {
    expect(() => ratingSchema.parse(0)).toThrow();
    expect(() => ratingSchema.parse(6)).toThrow();
    expect(() => ratingSchema.parse(3.5)).toThrow(); // must be integer
  });
});

describe("currencyAmountPaiseSchema", () => {
  it("accepts non-negative integers", () => {
    expect(currencyAmountPaiseSchema.parse(0)).toBe(0);
    expect(currencyAmountPaiseSchema.parse(10000)).toBe(10000);
  });

  it("rejects negative amounts", () => {
    expect(() => currencyAmountPaiseSchema.parse(-1)).toThrow();
  });

  it("rejects non-integers", () => {
    expect(() => currencyAmountPaiseSchema.parse(10.5)).toThrow();
  });
});

// ──────────────────────────────────────────────
// Auth schemas
// ──────────────────────────────────────────────

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.parse({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      role: "CUSTOMER",
    });
    expect(result.email).toBe("test@example.com");
    expect(result.name).toBe("Test User");
    expect(result.role).toBe("CUSTOMER");
  });

  it("defaults role to CUSTOMER", () => {
    const result = registerSchema.parse({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });
    expect(result.role).toBe("CUSTOMER");
  });

  it("accepts SHOP_OWNER role", () => {
    const result = registerSchema.parse({
      email: "owner@example.com",
      password: "password123",
      name: "Shop Owner",
      role: "SHOP_OWNER",
    });
    expect(result.role).toBe("SHOP_OWNER");
  });

  it("rejects ADMIN role", () => {
    expect(() =>
      registerSchema.parse({
        email: "admin@example.com",
        password: "password123",
        name: "Admin",
        role: "ADMIN",
      })
    ).toThrow();
  });

  it("rejects missing name", () => {
    expect(() =>
      registerSchema.parse({
        email: "test@example.com",
        password: "password123",
      })
    ).toThrow();
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.parse({
      email: "test@example.com",
      password: "mypassword",
    });
    expect(result.email).toBe("test@example.com");
  });

  it("rejects empty password", () => {
    expect(() =>
      loginSchema.parse({
        email: "test@example.com",
        password: "",
      })
    ).toThrow();
  });
});

// ──────────────────────────────────────────────
// Business schemas
// ──────────────────────────────────────────────

describe("createBusinessSchema", () => {
  const validBusiness = {
    name: "Test Salon",
    address: "123 Main Street",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
    categoryId: "clxxxxxxxxxxxxxxxxx123",
  };

  it("accepts valid business data", () => {
    const result = createBusinessSchema.parse(validBusiness);
    expect(result.name).toBe("Test Salon");
    expect(result.timezone).toBe("Asia/Kolkata");
  });

  it("rejects short business names", () => {
    expect(() =>
      createBusinessSchema.parse({ ...validBusiness, name: "A" })
    ).toThrow();
  });

  it("rejects short addresses", () => {
    expect(() =>
      createBusinessSchema.parse({ ...validBusiness, address: "Hi" })
    ).toThrow();
  });

  it("rejects invalid pincodes", () => {
    expect(() =>
      createBusinessSchema.parse({ ...validBusiness, pincode: "abc" })
    ).toThrow();
  });
});

// ──────────────────────────────────────────────
// Service schemas
// ──────────────────────────────────────────────

describe("createServiceSchema", () => {
  it("accepts valid service data", () => {
    const result = createServiceSchema.parse({
      name: "Haircut",
      durationMinutes: 30,
      priceAmount: 50000, // ₹500
    });
    expect(result.name).toBe("Haircut");
    expect(result.currency).toBe("INR");
  });

  it("rejects too short duration", () => {
    expect(() =>
      createServiceSchema.parse({
        name: "Quick",
        durationMinutes: 3,
        priceAmount: 1000,
      })
    ).toThrow();
  });

  it("rejects too long duration", () => {
    expect(() =>
      createServiceSchema.parse({
        name: "Marathon",
        durationMinutes: 500,
        priceAmount: 1000,
      })
    ).toThrow();
  });
});

// ──────────────────────────────────────────────
// Queue & Booking schemas
// ──────────────────────────────────────────────

describe("joinQueueSchema", () => {
  it("accepts valid queue join data", () => {
    const result = joinQueueSchema.parse({
      businessId: "clxxxxxxxxxxxxxxxxx123",
      serviceId: "clxxxxxxxxxxxxxxxxx456",
    });
    expect(result.businessId).toBeTruthy();
  });

  it("rejects invalid IDs", () => {
    expect(() =>
      joinQueueSchema.parse({
        businessId: "not-a-cuid",
        serviceId: "also-not",
      })
    ).toThrow();
  });
});

describe("createAppointmentSchema", () => {
  it("accepts valid appointment data", () => {
    const result = createAppointmentSchema.parse({
      businessId: "clxxxxxxxxxxxxxxxxx123",
      serviceId: "clxxxxxxxxxxxxxxxxx456",
      date: "2026-12-01",
      startTime: "10:00",
    });
    expect(result.startTime).toBe("10:00");
    expect(result.date).toBeInstanceOf(Date);
  });

  it("rejects invalid time format", () => {
    expect(() =>
      createAppointmentSchema.parse({
        businessId: "clxxxxxxxxxxxxxxxxx123",
        serviceId: "clxxxxxxxxxxxxxxxxx456",
        date: "2026-12-01",
        startTime: "25:00",
      })
    ).toThrow();
  });
});

// ──────────────────────────────────────────────
// Review schema
// ──────────────────────────────────────────────

describe("createReviewSchema", () => {
  it("accepts valid review data", () => {
    const result = createReviewSchema.parse({
      businessId: "clxxxxxxxxxxxxxxxxx123",
      bookingId: "clxxxxxxxxxxxxxxxxx456",
      bookingType: "APPOINTMENT",
      rating: 5,
      comment: "Great service!",
    });
    expect(result.rating).toBe(5);
    expect(result.bookingType).toBe("APPOINTMENT");
  });

  it("accepts QUEUE_TICKET booking type", () => {
    const result = createReviewSchema.parse({
      businessId: "clxxxxxxxxxxxxxxxxx123",
      bookingId: "clxxxxxxxxxxxxxxxxx456",
      bookingType: "QUEUE_TICKET",
      rating: 3,
    });
    expect(result.bookingType).toBe("QUEUE_TICKET");
  });

  it("rejects invalid booking type", () => {
    expect(() =>
      createReviewSchema.parse({
        businessId: "clxxxxxxxxxxxxxxxxx123",
        bookingId: "clxxxxxxxxxxxxxxxxx456",
        bookingType: "INVALID",
        rating: 3,
      })
    ).toThrow();
  });
});

// ──────────────────────────────────────────────
// Commission policy schema
// ──────────────────────────────────────────────

describe("createCommissionPolicySchema", () => {
  it("accepts valid policy data", () => {
    const result = createCommissionPolicySchema.parse({
      name: "Standard Commission",
      ratePercent: 10,
    });
    expect(result.name).toBe("Standard Commission");
    expect(result.ratePercent).toBe(10);
  });

  it("accepts policy with min/max bounds", () => {
    const result = createCommissionPolicySchema.parse({
      name: "Bounded Commission",
      ratePercent: 15,
      minAmountPaise: 1000,
      maxAmountPaise: 50000,
    });
    expect(result.minAmountPaise).toBe(1000);
    expect(result.maxAmountPaise).toBe(50000);
  });

  it("rejects rate > 100", () => {
    expect(() =>
      createCommissionPolicySchema.parse({
        name: "Bad Rate",
        ratePercent: 150,
      })
    ).toThrow();
  });

  it("rejects negative rate", () => {
    expect(() =>
      createCommissionPolicySchema.parse({
        name: "Negative Rate",
        ratePercent: -5,
      })
    ).toThrow();
  });
});

// ──────────────────────────────────────────────
// Pagination & search schemas
// ──────────────────────────────────────────────

describe("paginationSchema", () => {
  it("applies defaults", () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it("coerces string values", () => {
    const result = paginationSchema.parse({ page: "3", limit: "50" });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
  });

  it("rejects page < 1", () => {
    expect(() => paginationSchema.parse({ page: 0 })).toThrow();
  });

  it("rejects limit > 100", () => {
    expect(() => paginationSchema.parse({ limit: 200 })).toThrow();
  });
});

describe("searchBusinessesSchema", () => {
  it("accepts a complete search query", () => {
    const result = searchBusinessesSchema.parse({
      q: "salon",
      category: "beauty-wellness",
      city: "Bangalore",
      sortBy: "rating",
      page: "2",
      limit: "10",
    });
    expect(result.q).toBe("salon");
    expect(result.sortBy).toBe("rating");
    expect(result.page).toBe(2);
  });

  it("defaults sortBy to relevance", () => {
    const result = searchBusinessesSchema.parse({});
    expect(result.sortBy).toBe("relevance");
  });
});
