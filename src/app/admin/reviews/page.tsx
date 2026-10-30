import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Star, Flag } from "lucide-react";

export const metadata: Metadata = {
  title: "Review Moderation",
  description: "Moderate user reviews on QueueLess.",
};

export default async function AdminReviewsPage() {
  await requireRole("ADMIN");

  let reviews: Array<Record<string, unknown>> = [];
  try {
    reviews = await prisma.review.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        business: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }) as unknown as Array<Record<string, unknown>>;
  } catch {}

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Review Moderation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor and moderate user reviews
        </p>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id as string}
              className={`rounded-xl border p-4 ${
                review.isModerated ? "bg-destructive/5 border-destructive/20" : "bg-card"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < (review.rating as number)
                              ? "fill-warning text-warning"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {(review.customer as { name: string }).name}
                    </span>
                    {review.isModerated === true && (
                      <Badge variant="outline" className="text-xs gap-1 bg-destructive/10 text-destructive border-destructive/20">
                        <Flag className="h-3 w-3" />
                        Moderated
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    on <span className="font-medium">{(review.business as { name: string }).name}</span>
                    {" • "}
                    {new Date(review.createdAt as string).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {typeof review.comment === "string" && review.comment && (
                <p className="text-sm text-muted-foreground">{String(review.comment)}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed">
          <Star className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No reviews yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reviews will appear here once customers submit them.
          </p>
        </div>
      )}
    </div>
  );
}
