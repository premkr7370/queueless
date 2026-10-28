"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { POPULAR_SEARCHES } from "@/lib/constants";

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  return (
    <section
      className="relative overflow-hidden gradient-bg-hero"
      id="hero"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Real-time queue tracking
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Find the right service.{" "}
            <span className="gradient-text">Skip the wait.</span>
          </h1>

          {/* Supporting text */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Discover trusted local businesses, book your appointment, and track
            your queue in real time.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-10 max-w-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-2 shadow-xl shadow-primary/5 sm:flex-row sm:items-center"
              id="hero-search-form"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for a service or business..."
                  className="border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="hero-search-input"
                  aria-label="Search for a service or business"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1.5 text-muted-foreground"
                  id="hero-location-btn"
                >
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Location</span>
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="shrink-0 gap-1.5 px-6"
                  id="hero-search-btn"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </form>
          </div>

          {/* Popular Searches */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {POPULAR_SEARCHES.map((search) => (
              <Link
                key={search}
                href={`/explore?q=${encodeURIComponent(search)}`}
                className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
              >
                {search}
              </Link>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="gap-2 px-8"
              render={<Link href="/explore" />}
              id="hero-explore-btn"
            >
              Explore Services
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 px-8"
              render={<Link href="/register?role=owner" />}
              id="hero-list-btn"
            >
              List Your Business
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
