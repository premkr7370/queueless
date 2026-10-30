import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServerHeader, Footer } from "@/components/layout";
import { BusinessCard } from "@/components/explore/business-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { CATEGORIES, FEATURED_BUSINESSES } from "@/lib/constants";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: category.name,
    description: `Find and book ${category.name.toLowerCase()} services near you on QueueLess. ${category.description}`,
  };
}

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const businesses = FEATURED_BUSINESSES.filter(
    (b) => b.categorySlug === slug
  );

  return (
    <>
      <ServerHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/explore" className="hover:text-foreground transition-colors">
              Explore
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">{category.name}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {category.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              {category.description}
            </p>
          </div>

          {/* Business Grid */}
          {businesses.length > 0 ? (
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
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h2 className="text-lg font-semibold">No businesses yet</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                No {category.name.toLowerCase()} businesses listed yet. Check back soon!
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 flex gap-3">
            <Button variant="outline" className="gap-2" render={<Link href="/explore" />}>
              <ArrowLeft className="h-4 w-4" />
              All Categories
            </Button>
            <Button render={<Link href={`/explore?category=${slug}`} />}>
              Search all {category.name}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
