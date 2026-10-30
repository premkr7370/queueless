import { PrismaClient, UserRole, VerificationStatus, MembershipRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Categories ───
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "healthcare" },
      update: {},
      create: {
        slug: "healthcare",
        name: "Healthcare",
        description: "Clinics, hospitals, specialists, and general practitioners",
        icon: "Heart",
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "dental-care" },
      update: {},
      create: {
        slug: "dental-care",
        name: "Dental Care",
        description: "Dentists, orthodontists, and oral health specialists",
        icon: "Smile",
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "salon-spa" },
      update: {},
      create: {
        slug: "salon-spa",
        name: "Salon & Spa",
        description: "Haircuts, styling, facials, massages, and beauty treatments",
        icon: "Scissors",
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "diagnostics" },
      update: {},
      create: {
        slug: "diagnostics",
        name: "Diagnostics",
        description: "Pathology labs, imaging centers, and diagnostic services",
        icon: "Microscope",
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "repair-services" },
      update: {},
      create: {
        slug: "repair-services",
        name: "Repair Services",
        description: "Electronics, appliances, vehicle servicing, and maintenance",
        icon: "Wrench",
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: "government" },
      update: {},
      create: {
        slug: "government",
        name: "Government Services",
        description: "Passport, license, permits, and municipal offices",
        icon: "Building2",
        sortOrder: 6,
      },
    }),
  ]);

  console.log(`✅ ${categories.length} categories seeded`);

  // ─── Admin user ───
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@queueless.example.com" },
    update: {},
    create: {
      email: "admin@queueless.example.com",
      name: "QueueLess Admin",
      passwordHash: "693c40205ecc6d98f00a115fe221a7a91bb927b7d84c40216fce2c83790b8ca4", // password: admin123
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  console.log(`✅ Admin user seeded: ${adminUser.email}`);

  // ─── Demo shop owner ───
  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@queueless.example.com" },
    update: {},
    create: {
      email: "owner@queueless.example.com",
      name: "Dr. Priya Sharma",
      phone: "+919876543210",
      passwordHash: "b6e47d469cf71f51db1fa919fe12c0cbd13d348873c4db5c6efd5a8f1f87ddb8", // password: owner123
      role: UserRole.SHOP_OWNER,
      emailVerified: true,
    },
  });

  console.log(`✅ Shop owner seeded: ${ownerUser.email}`);

  // ─── Demo customer ───
  const customerUser = await prisma.user.upsert({
    where: { email: "customer@queueless.example.com" },
    update: {},
    create: {
      email: "customer@queueless.example.com",
      name: "Rahul Patel",
      phone: "+919123456789",
      passwordHash: "c4433f535d42d9ffe5917a1b40c770bc532ff3fda0f01962de3c14bf8cda350e", // password: customer123
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });

  console.log(`✅ Customer seeded: ${customerUser.email}`);

  // ─── Demo businesses ───
  const healthcareCategory = categories[0];
  const salonCategory = categories[2];

  const clinic = await prisma.business.upsert({
    where: { slug: "sunrise-health-clinic" },
    update: {},
    create: {
      slug: "sunrise-health-clinic",
      name: "Sunrise Health Clinic",
      description: "Multi-specialty clinic offering general consultations, pediatrics, and diagnostics. Walk-ins and appointments welcome.",
      address: "123 MG Road, Koramangala",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560034",
      phone: "+918012345678",
      email: "info@sunriseclinic.example.com",
      timezone: "Asia/Kolkata",
      categoryId: healthcareCategory.id,
      verificationStatus: VerificationStatus.APPROVED,
      isActive: true,
    },
  });

  const salon = await prisma.business.upsert({
    where: { slug: "elite-cuts-salon" },
    update: {},
    create: {
      slug: "elite-cuts-salon",
      name: "Elite Cuts Salon",
      description: "Premium unisex salon offering haircuts, styling, coloring, and spa treatments.",
      address: "45 Brigade Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      phone: "+918098765432",
      email: "book@elitecuts.example.com",
      timezone: "Asia/Kolkata",
      categoryId: salonCategory.id,
      verificationStatus: VerificationStatus.APPROVED,
      isActive: true,
    },
  });

  console.log(`✅ ${2} businesses seeded`);

  // ─── Business memberships ───
  await prisma.businessMembership.upsert({
    where: { userId_businessId: { userId: ownerUser.id, businessId: clinic.id } },
    update: {},
    create: {
      userId: ownerUser.id,
      businessId: clinic.id,
      role: MembershipRole.OWNER,
    },
  });

  await prisma.businessMembership.upsert({
    where: { userId_businessId: { userId: ownerUser.id, businessId: salon.id } },
    update: {},
    create: {
      userId: ownerUser.id,
      businessId: salon.id,
      role: MembershipRole.OWNER,
    },
  });

  console.log("✅ Business memberships seeded");

  // ─── Services ───
  await prisma.service.createMany({
    skipDuplicates: true,
    data: [
      {
        businessId: clinic.id,
        name: "General Consultation",
        description: "15-minute consultation with a general physician",
        durationMinutes: 15,
        priceAmount: 50000, // ₹500.00
        currency: "INR",
        sortOrder: 1,
      },
      {
        businessId: clinic.id,
        name: "Pediatric Consultation",
        description: "Specialized consultation for children under 12",
        durationMinutes: 20,
        priceAmount: 80000, // ₹800.00
        currency: "INR",
        sortOrder: 2,
      },
      {
        businessId: salon.id,
        name: "Haircut - Men",
        description: "Professional haircut with wash and style",
        durationMinutes: 30,
        priceAmount: 40000, // ₹400.00
        currency: "INR",
        sortOrder: 1,
      },
      {
        businessId: salon.id,
        name: "Hair Coloring",
        description: "Full hair coloring with premium products",
        durationMinutes: 90,
        priceAmount: 250000, // ₹2,500.00
        currency: "INR",
        sortOrder: 2,
      },
    ],
  });

  console.log("✅ Services seeded");

  // ─── Business hours (Mon-Sat open, Sun closed) ───
  const defaultHours = (businessId: string) =>
    Array.from({ length: 7 }, (_, day) => ({
      businessId,
      dayOfWeek: day,
      openTime: "09:00",
      closeTime: "18:00",
      isClosed: day === 0, // Sunday closed
    }));

  for (const biz of [clinic, salon]) {
    for (const hours of defaultHours(biz.id)) {
      await prisma.businessHours.upsert({
        where: { businessId_dayOfWeek: { businessId: hours.businessId, dayOfWeek: hours.dayOfWeek } },
        update: {},
        create: hours,
      });
    }
  }

  console.log("✅ Business hours seeded");

  // ─── Commission policy ───
  const existingPolicy = await prisma.commissionPolicy.findFirst({ where: { isActive: true } });
  if (!existingPolicy) {
    await prisma.commissionPolicy.create({
      data: {
        name: "Default 10% Commission",
        ratePercent: 10.0,
        isActive: true,
      },
    });
    console.log("✅ Commission policy seeded");
  }

  console.log("\n🎉 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
