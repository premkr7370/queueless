/**
 * QueueLess — Seed categories and featured business data for development.
 *
 * In production, categories and businesses come from the database.
 * This file provides realistic demo data for the homepage during development.
 * All businesses listed here are fictional and labelled as demo data.
 */

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  businessCount?: number;
}

export interface FeaturedBusiness {
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  address: string;
  city: string;
  rating: number | null;
  reviewCount: number;
  priceIndicator: "₹" | "₹₹" | "₹₹₹";
  isOpen: boolean;
  isVerified: boolean;
  nextAvailable: string | null;
  queueLength: number | null;
  imageUrl: string;
  isDemoData: boolean;
}

export const CATEGORIES: Category[] = [
  {
    slug: "healthcare",
    name: "Healthcare",
    description: "Clinics, general physicians, and specialist consultations",
    icon: "Heart",
  },
  {
    slug: "dental-care",
    name: "Dental Care",
    description: "Dental clinics, orthodontics, and oral health services",
    icon: "Smile",
  },
  {
    slug: "salon-barber",
    name: "Salon & Barber",
    description: "Haircuts, styling, grooming, and beauty treatments",
    icon: "Scissors",
  },
  {
    slug: "spa-wellness",
    name: "Spa & Wellness",
    description: "Massage therapy, facials, and relaxation services",
    icon: "Sparkles",
  },
  {
    slug: "diagnostics",
    name: "Diagnostics",
    description: "Lab tests, health checkups, and imaging services",
    icon: "Microscope",
  },
  {
    slug: "repair-services",
    name: "Repair Services",
    description: "Electronics, appliance, and vehicle repair and maintenance",
    icon: "Wrench",
  },
];

export const FEATURED_BUSINESSES: FeaturedBusiness[] = [
  {
    slug: "sunrise-health-clinic",
    name: "Sunrise Health Clinic",
    category: "Healthcare",
    categorySlug: "healthcare",
    address: "42 MG Road, Indiranagar",
    city: "Bengaluru",
    rating: 4.6,
    reviewCount: 128,
    priceIndicator: "₹₹",
    isOpen: true,
    isVerified: true,
    nextAvailable: "Today, 3:30 PM",
    queueLength: 4,
    imageUrl: "/images/demo/clinic.jpg",
    isDemoData: true,
  },
  {
    slug: "elite-cuts-salon",
    name: "Elite Cuts Salon",
    category: "Salon & Barber",
    categorySlug: "salon-barber",
    address: "15 Brigade Road",
    city: "Bengaluru",
    rating: 4.8,
    reviewCount: 256,
    priceIndicator: "₹₹",
    isOpen: true,
    isVerified: true,
    nextAvailable: "Today, 2:00 PM",
    queueLength: 2,
    imageUrl: "/images/demo/salon.jpg",
    isDemoData: true,
  },
  {
    slug: "serenity-spa",
    name: "Serenity Spa & Wellness",
    category: "Spa & Wellness",
    categorySlug: "spa-wellness",
    address: "78 Residency Road",
    city: "Bengaluru",
    rating: 4.7,
    reviewCount: 89,
    priceIndicator: "₹₹₹",
    isOpen: true,
    isVerified: true,
    nextAvailable: "Tomorrow, 10:00 AM",
    queueLength: null,
    imageUrl: "/images/demo/spa.jpg",
    isDemoData: true,
  },
  {
    slug: "bright-smile-dental",
    name: "Bright Smile Dental",
    category: "Dental Care",
    categorySlug: "dental-care",
    address: "23 Jayanagar 4th Block",
    city: "Bengaluru",
    rating: 4.5,
    reviewCount: 67,
    priceIndicator: "₹₹",
    isOpen: false,
    isVerified: true,
    nextAvailable: "Tomorrow, 9:00 AM",
    queueLength: null,
    imageUrl: "/images/demo/dental.jpg",
    isDemoData: true,
  },
  {
    slug: "quickfix-repairs",
    name: "QuickFix Electronics",
    category: "Repair Services",
    categorySlug: "repair-services",
    address: "56 SP Road",
    city: "Bengaluru",
    rating: 4.3,
    reviewCount: 42,
    priceIndicator: "₹",
    isOpen: true,
    isVerified: false,
    nextAvailable: "Today, 4:00 PM",
    queueLength: 6,
    imageUrl: "/images/demo/repair.jpg",
    isDemoData: true,
  },
  {
    slug: "metro-diagnostics",
    name: "Metro Diagnostics Center",
    category: "Diagnostics",
    categorySlug: "diagnostics",
    address: "112 Koramangala",
    city: "Bengaluru",
    rating: 4.4,
    reviewCount: 93,
    priceIndicator: "₹₹",
    isOpen: true,
    isVerified: true,
    nextAvailable: "Today, 5:00 PM",
    queueLength: 3,
    imageUrl: "/images/demo/diagnostics.jpg",
    isDemoData: true,
  },
];

export const POPULAR_SEARCHES = [
  "General Physician",
  "Haircut",
  "Dental Cleaning",
  "Full Body Checkup",
  "Spa Massage",
  "Phone Repair",
];

export const FAQ_ITEMS = [
  {
    question: "How does booking work on QueueLess?",
    answer:
      "Browse local businesses, select a service, and choose between booking an appointment for a specific time or joining a walk-in queue for immediate service. You'll receive a digital token and real-time queue updates.",
  },
  {
    question: "Do I pay online or at the business?",
    answer:
      "Payment options vary by business. Some businesses accept online payments through QueueLess, while others prefer payment at the counter. Each business listing clearly shows the accepted payment methods.",
  },
  {
    question: "What is the cancellation and refund policy?",
    answer:
      "Cancellation policies are set by individual businesses. You can view each business's cancellation policy before booking. If you cancel within the allowed window, you may be eligible for a full or partial refund depending on the business's policy.",
  },
  {
    question: "How does business verification work?",
    answer:
      "Businesses submit their details and documentation for review by the QueueLess team. Verified businesses display a badge on their listing. Verification confirms that the business has been reviewed — it does not constitute a guarantee of service quality.",
  },
  {
    question: "How is commission calculated?",
    answer:
      "QueueLess charges a configurable platform commission on completed bookings. The commission rate is displayed to business owners during onboarding and is recorded as an immutable snapshot with each booking. Current default is 10% of the eligible service amount.",
  },
  {
    question: "How is my personal data protected?",
    answer:
      "We follow data minimization principles and store only what is necessary for the service. Your booking details are never shared publicly, and we use encrypted connections and secure authentication for all transactions.",
  },
];
