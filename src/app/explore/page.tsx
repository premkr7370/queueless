import type { Metadata } from "next";
import { Suspense } from "react";
import { Header, Footer } from "@/components/layout";
import { SearchFilters } from "@/components/explore/search-filters";
import { BusinessCard } from "@/components/explore/business-card";
import { Pagination } from "@/components/explore/pagination";
import { searchBusinessesAction } from "@/server/actions/business.actions";
import { FEATURED_BUSINESSES } from "@/lib/constants";
import { Search, Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Explore Services",
  description:
    "Search and discover local businesses on QueueLess. Browse by category, location, and service type.",
};

interface ExplorePageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

async function BusinessResults({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const q = searchParams.q;
  const category = searchParams.category;
  const city = searchParams.city;
  const page = parseInt(searchParams.page || "1", 10);
  const sortBy = searchParams.sortBy;

  // Try database first, fall back to demo data
  let businesses: typeof FEATURED_BUSINESSES = [];
  let pagination = { page: 1, limit: 12, total: 0, totalPages: 0 };

  try {
    const result = await searchBusinessesAction({ q, category, city, page, sortBy });
    if (result.businesses.length > 0) {
      businesses = result.businesses.map((b: Record<string, unknown>) => ({
        slug: b.slug as string,
        name: b.name as string,
        category: (b.category as Record<string, string>)?.name || "",
        categorySlug: (b.category as Record<string, string>)?.slug || "",
        address: b.address as string,
        city: b.city as string,
        rating: null,
        reviewCount: ((b._count as Record<string, number>)?.reviews) || 0,
        priceIndicator: "₹₹" as const,
        isOpen: true,
        isVerified: (b.verificationStatus as string) === "APPROVED",
        nextAvailable: null,
        queueLength: null,
        imageUrl: "",
        isDemoData: false as const,
      }));
      pagination = result.pagination;
    }
  } catch {
    // Database not available, use demo data
  }

  // Fall back to demo data if no DB results
  if (businesses.length === 0) {
    let filtered = [...FEATURED_BUSINESSES];
    if (q) {
      const lower = q.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(lower) ||
          b.category.toLowerCase().includes(lower)
      );
    }
    if (category) {
      filtered = filtered.filter((b) => b.categorySlug === category);
    }
    if (city) {
      filtered = filtered.filter((b) =>
        b.city.toLowerCase().includes(city.toLowerCase())
      );
    }
    businesses = filtered;
    pagination = {
      page: 1,
      limit: 12,
      total: filtered.length,
      totalPages: 1,
    };
  }

  if (businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="mt-5 text-lg font-semibold">No businesses found</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Try adjusting your search or filters to find what you&apos;re looking
          for.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {businesses.map((biz) => (
          <BusinessCard
            key={biz.slug}
            slug={biz.slug}
            name={biz.name}
            category={biz.category}
            categorySlug={biz.categorySlug}
            address={biz.address}
            city={biz.city}
            rating={biz.rating}
            reviewCount={biz.reviewCount}
            isVerified={biz.isVerified}
            isOpen={biz.isOpen}
            queueLength={biz.queueLength}
          />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
          />
        </div>
      )}
    </>
  );
}

function LoadingGrid() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Explore Services
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Discover local businesses, book appointments, and skip the wait
            </p>
          </div>

          {/* Search & Filters */}
          <Suspense>
            <SearchFilters />
          </Suspense>

          {/* Results */}
          <div className="mt-8">
            <Suspense fallback={<LoadingGrid />}>
              <BusinessResults searchParams={params} />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
