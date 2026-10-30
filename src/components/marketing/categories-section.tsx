import Link from "next/link";
import {
  Heart,
  Smile,
  Scissors,
  Sparkles,
  Microscope,
  Wrench,
  ArrowRight,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

const ICON_MAP: Record<string, React.ElementType> = {
  Heart,
  Smile,
  Scissors,
  Sparkles,
  Microscope,
  Wrench,
};

export function CategoriesSection() {
  return (
    <section
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      id="categories"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Popular Categories
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Browse services by category to find exactly what you need
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">
        {CATEGORIES.map((category) => {
          const Icon = ICON_MAP[category.icon] ?? Heart;
          return (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group relative flex flex-col items-center rounded-2xl border border-border/60 bg-card p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              id={`category-${category.slug}`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {category.name}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {category.description}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          id="categories-view-all"
        >
          View all categories
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
