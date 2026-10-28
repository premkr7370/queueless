import {
  Clock,
  ShieldCheck,
  BadgeCheck,
  CalendarCheck,
  Eye,
  Bell,
} from "lucide-react";

const BENEFITS = [
  {
    icon: Clock,
    title: "Less Unnecessary Waiting",
    description:
      "Join queues remotely and arrive when it's your turn. Spend your time how you want, not in a waiting room.",
  },
  {
    icon: Eye,
    title: "Transparent Booking",
    description:
      "See real-time queue positions, estimated wait times, and available appointment slots before you commit.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Businesses",
    description:
      "Businesses that have completed our verification process are marked with a verified badge for your confidence.",
  },
  {
    icon: CalendarCheck,
    title: "Convenient Booking",
    description:
      "Book appointments or walk-in slots in seconds. Get reminders so you never miss your turn.",
  },
  {
    icon: Bell,
    title: "Real-Time Notifications",
    description:
      "Receive updates when your queue position changes or when it's almost your turn to be served.",
  },
  {
    icon: ShieldCheck,
    title: "Better Queue Visibility",
    description:
      "Track your position live and know exactly where you stand. No more guessing or asking staff.",
  },
] as const;

export function WhyChooseSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="why-choose">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Why Choose QueueLess?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Built for customers who value their time
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((benefit) => (
          <div
            key={benefit.title}
            className="group rounded-2xl border border-border/60 bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <benefit.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">
              {benefit.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
