import Link from "next/link";
import { MapPin, Star, Clock, Users, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BusinessCardProps {
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  address: string;
  city: string;
  rating?: number | null;
  reviewCount: number;
  isVerified?: boolean;
  isOpen?: boolean;
  queueLength?: number | null;
}

export function BusinessCard({
  slug,
  name,
  category,
  address,
  city,
  rating,
  reviewCount,
  isVerified,
  isOpen,
  queueLength,
}: BusinessCardProps) {
  return (
    <Link
      href={`/business/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
    >
      {/* Color band at top */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

      <div className="flex flex-1 flex-col p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-tight truncate group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="mt-1 text-xs font-medium text-primary/70">{category}</p>
          </div>
          {isVerified && (
            <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
              <BadgeCheck className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{address}, {city}</span>
        </div>

        {/* Stats row */}
        <div className="mt-auto flex items-center gap-4 pt-3 border-t border-border/60">
          {rating != null && (
            <div className="flex items-center gap-1 text-xs">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviewCount})</span>
            </div>
          )}

          {isOpen != null && (
            <div className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              <span className={isOpen ? "text-success font-medium" : "text-muted-foreground"}>
                {isOpen ? "Open" : "Closed"}
              </span>
            </div>
          )}

          {queueLength != null && queueLength > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{queueLength} in queue</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
