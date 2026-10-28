import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Mail,
  Star,
  Clock,
  BadgeCheck,
  Calendar,
  Users,
  ChevronRight,
} from "lucide-react";
import { FEATURED_BUSINESSES, CATEGORIES } from "@/lib/constants";
import { getBusinessBySlugAction } from "@/server/actions/business.actions";
import { formatCurrency } from "@/lib/commission";

interface BusinessPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Try DB first
  try {
    const biz = await getBusinessBySlugAction(slug);
    if (biz) {
      return {
        title: biz.name,
        description: `${biz.name} — ${biz.category.name} in ${biz.city}. Book an appointment or join the queue on QueueLess.`,
      };
    }
  } catch {}

  const business = FEATURED_BUSINESSES.find((b) => b.slug === slug);
  if (!business) return { title: "Business Not Found" };
  return {
    title: business.name,
    description: `${business.name} — ${business.category} in ${business.city}. Book an appointment or join the queue on QueueLess.`,
  };
}

export function generateStaticParams() {
  return FEATURED_BUSINESSES.map((b) => ({ slug: b.slug }));
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;

  // Try database first
  let dbBiz: Awaited<ReturnType<typeof getBusinessBySlugAction>> | null = null;
  try {
    dbBiz = await getBusinessBySlugAction(slug);
  } catch {}

  const demoBiz = FEATURED_BUSINESSES.find((b) => b.slug === slug);

  if (!dbBiz && !demoBiz) {
    notFound();
  }

  // Normalize data
  const name = dbBiz?.name ?? demoBiz!.name;
  const categoryName = dbBiz?.category.name ?? demoBiz!.category;
  const address = dbBiz ? `${dbBiz.address}, ${dbBiz.city}, ${dbBiz.state}` : `${demoBiz!.address}, ${demoBiz!.city}`;
  const city = dbBiz?.city ?? demoBiz!.city;
  const isVerified = dbBiz ? dbBiz.verificationStatus === "APPROVED" : (demoBiz?.isVerified ?? false);
  const phone = dbBiz?.phone;
  const email = dbBiz?.email;
  const website = dbBiz?.website;
  const description = dbBiz?.description;
  const services = dbBiz?.services ?? [];
  const hours = dbBiz?.businessHours ?? [];
  const reviews = dbBiz?.reviews ?? [];
  const reviewCount = dbBiz?._count.reviews ?? demoBiz?.reviewCount ?? 0;
  const rating = demoBiz?.rating ?? null;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/explore" className="hover:text-foreground transition-colors">
              Explore
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground truncate">{name}</span>
          </div>

          {/* Business Header */}
          <div className="rounded-2xl border bg-card overflow-hidden mb-8">
            <div className="h-2 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {name}
                    </h1>
                    {isVerified && (
                      <Badge variant="secondary" className="gap-1 shrink-0">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-primary/70 mb-3">
                    {categoryName}
                  </p>

                  {description && (
                    <p className="text-sm text-muted-foreground max-w-2xl mb-4">
                      {description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {address}
                    </span>
                    {phone && (
                      <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-foreground">
                        <Phone className="h-4 w-4" />
                        {phone}
                      </a>
                    )}
                    {email && (
                      <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-foreground">
                        <Mail className="h-4 w-4" />
                        {email}
                      </a>
                    )}
                    {website && (
                      <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground">
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 sm:gap-8 pt-2">
                  {rating != null && (
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-warning text-warning" />
                        <span className="text-2xl font-bold">{rating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{reviewCount} reviews</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Services */}
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Services
                </h2>
                {services.length > 0 ? (
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-accent/30"
                      >
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium">{service.name}</h3>
                          {service.description && (
                            <p className="mt-0.5 text-sm text-muted-foreground truncate">
                              {service.description}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {service.durationMinutes} min
                          </p>
                        </div>
                        <div className="ml-4 text-right shrink-0">
                          <p className="font-semibold text-sm">
                            {formatCurrency(service.priceAmount, service.currency)}
                          </p>
                          <Button size="sm" className="mt-2 h-8 text-xs">
                            Book
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                    <p>Services will be available once the business completes setup.</p>
                  </div>
                )}
              </section>

              {/* Reviews */}
              <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Reviews
                </h2>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="rounded-xl border p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating
                                    ? "fill-warning text-warning"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{review.customer.name}</span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No reviews yet.
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Action Cards */}
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Book Appointment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose a service and pick a time slot that works for you.
                </p>
                <Button className="w-full" render={<Link href={`/business/${slug}#services`} />}>
                  View Available Slots
                </Button>
              </div>

              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Walk-in Queue
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get a virtual token and wait from anywhere. We&apos;ll notify you when it&apos;s your turn.
                </p>
                <Button variant="outline" className="w-full">
                  Join Queue
                </Button>
              </div>

              {/* Business Hours */}
              {hours.length > 0 && (
                <div className="rounded-2xl border bg-card p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Business Hours
                  </h3>
                  <div className="space-y-2">
                    {hours.map((h) => (
                      <div key={h.dayOfWeek} className="flex justify-between text-sm">
                        <span className={h.isClosed ? "text-muted-foreground" : ""}>
                          {DAYS[h.dayOfWeek]}
                        </span>
                        <span className={h.isClosed ? "text-muted-foreground" : "font-medium"}>
                          {h.isClosed ? "Closed" : `${h.openTime} – ${h.closeTime}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Back link */}
          <div className="mt-12">
            <Button variant="ghost" className="gap-2" render={<Link href="/explore" />}>
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
