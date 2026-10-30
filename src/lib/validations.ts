import { z } from "zod";

// ──────────────────────────────────────────────
// Shared validators
// ──────────────────────────────────────────────

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(255)
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number")
  .optional()
  .or(z.literal(""));

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
  .min(2)
  .max(100);

export const pincodeSchema = z
  .string()
  .regex(/^\d{5,6}$/, "Invalid pincode");

export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format");

export const ratingSchema = z
  .number()
  .int()
  .min(1, "Rating must be at least 1")
  .max(5, "Rating must be at most 5");

export const currencyAmountPaiseSchema = z
  .number()
  .int("Amount must be in whole minor currency units")
  .nonnegative("Amount cannot be negative");

// ──────────────────────────────────────────────
// Auth schemas
// ──────────────────────────────────────────────

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, "Name is required").max(100).trim(),
  phone: phoneSchema,
  role: z.enum(["CUSTOMER", "SHOP_OWNER"]).default("CUSTOMER"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ──────────────────────────────────────────────
// Business schemas
// ──────────────────────────────────────────────

export const createBusinessSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters").max(150).trim(),
  description: z.string().max(2000).optional(),
  address: z.string().min(5, "Address is required").max(300).trim(),
  city: z.string().min(2).max(100).trim(),
  state: z.string().min(2).max(100).trim(),
  pincode: pincodeSchema,
  phone: phoneSchema,
  email: emailSchema.optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  categoryId: z.string().cuid("Invalid category ID"),
  timezone: z.string().default("Asia/Kolkata"),
});

export const updateBusinessSchema = createBusinessSchema.partial();

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;

// ──────────────────────────────────────────────
// Service schemas
// ──────────────────────────────────────────────

export const createServiceSchema = z.object({
  name: z.string().min(1, "Service name is required").max(150).trim(),
  description: z.string().max(1000).optional(),
  durationMinutes: z.number().int().min(5).max(480),
  priceAmount: currencyAmountPaiseSchema,
  currency: z.string().length(3).default("INR"),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

// ──────────────────────────────────────────────
// Business hours schemas
// ──────────────────────────────────────────────

export const businessHoursSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: timeSchema,
  closeTime: timeSchema,
  breakStartTime: timeSchema.optional(),
  breakEndTime: timeSchema.optional(),
  isClosed: z.boolean().default(false),
});

export const setBusinessHoursSchema = z.array(businessHoursSchema).length(7);

export type BusinessHoursInput = z.infer<typeof businessHoursSchema>;

// ──────────────────────────────────────────────
// Appointment schemas
// ──────────────────────────────────────────────

export const createAppointmentSchema = z.object({
  businessId: z.string().cuid(),
  serviceId: z.string().cuid(),
  date: z.coerce.date(),
  startTime: timeSchema,
  notes: z.string().max(500).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

// ──────────────────────────────────────────────
// Queue ticket schemas
// ──────────────────────────────────────────────

export const joinQueueSchema = z.object({
  businessId: z.string().cuid(),
  serviceId: z.string().cuid(),
});

export type JoinQueueInput = z.infer<typeof joinQueueSchema>;

// ──────────────────────────────────────────────
// Review schemas
// ──────────────────────────────────────────────

export const createReviewSchema = z.object({
  businessId: z.string().cuid(),
  bookingId: z.string().cuid(),
  bookingType: z.enum(["APPOINTMENT", "QUEUE_TICKET"]),
  rating: ratingSchema,
  comment: z.string().max(2000).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ──────────────────────────────────────────────
// Commission schemas
// ──────────────────────────────────────────────

export const createCommissionPolicySchema = z.object({
  name: z.string().min(1).max(100).trim(),
  ratePercent: z.number().min(0).max(100),
  minAmountPaise: z.number().int().nonnegative().optional(),
  maxAmountPaise: z.number().int().nonnegative().optional(),
  effectiveFrom: z.coerce.date().optional(),
});

export type CreateCommissionPolicyInput = z.infer<typeof createCommissionPolicySchema>;

// ──────────────────────────────────────────────
// Search / pagination
// ──────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const searchBusinessesSchema = paginationSchema.extend({
  q: z.string().max(200).optional(),
  category: slugSchema.optional(),
  city: z.string().max(100).optional(),
  sortBy: z.enum(["relevance", "rating", "name", "newest"]).default("relevance"),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchBusinessesInput = z.infer<typeof searchBusinessesSchema>;
