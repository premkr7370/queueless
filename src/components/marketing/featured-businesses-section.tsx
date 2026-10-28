import Link from "next/link";
import {
  Star,
  MapPin,
  Clock,
  Users,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FEATURED_BUSINESSES, type FeaturedBusiness } from "@/lib/constants";

function BusinessCard({ business }: { business: FeaturedBusiness }) {
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
      id={`business-${business.slug}`}
    >
      {/* Image area */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
          <span className="text-4xl font-bold text-primary/20">
            {business.name.charAt(0)}
          </span>
        </div>
        {/* Status badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          {business.isOpen ? (
            <Badge className="bg-emerald-500/90 text-white text-xs shadow-sm hover:bg-emerald-500/90">
              Open
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs shadow-sm">
              Closed
            </Badge>
          )}
          {business.isDemoData && (
            <Badge variant="outline" className="bg-card/80 text-xs shadow-sm backdrop-blur-sm">
              Demo
            </Badge>
          )}
        </div>
        {business.isVerified && (
          <div className="absolute right-3 top-3">
            <div className="flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              Verified
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
              {business.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {business.category}
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium text-muted-foreground">
            {business.priceIndicator}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate text-xs">
            {business.address}, {business.city}
          </span>
        </div>

        {/* Rating */}
        {business.rating !== null && business.reviewCount > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 dark:bg-amber-500/10">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {business.rating}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              ({business.reviewCount} reviews)
            </span>
          </div>
        )}

        {/* Availability info */}
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border/40 pt-3">
          {business.nextAvailable && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{business.nextAvailable}</span>
            </div>
          )}
          {business.queueLength !== null && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{business.queueLength} in queue</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            render={<Link href={`/business/${business.slug}`} />}
          >
            View Details
          </Button>
          {business.isOpen ? (
            <Button
              size="sm"
              className="flex-1 text-xs"
              render={<Link href={`/business/${business.slug}#book`} />}
            >
              Book Now
            </Button>
          ) : (
            <Button size="sm" className="flex-1 text-xs" disabled>
              Closed
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeaturedBusinessesSection() {
  return (
    <section className="border-t border-border/40 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="featured-businesses">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Featured Businesses
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Top-rated local businesses ready to serve you
          </p>
          <p className="mt-1 text-xs text-muted-foreground italic">
            Showing demo data for development purposes
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_BUSINESSES.map((business) => (
            <BusinessCard key={business.slug} business={business} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            render={<Link href="/explore" />}
            id="featured-explore-all"
          >
            Explore All Businesses
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
