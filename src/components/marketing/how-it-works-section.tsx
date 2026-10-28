import { Search, CalendarCheck, Radio } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Discover a service",
    description:
      "Search for local businesses by category, location, or service type. Compare ratings, availability, and pricing.",
    step: "01",
  },
  {
    icon: CalendarCheck,
    title: "Book a slot or join the queue",
    description:
      "Choose an appointment time that works for you, or join a walk-in queue and get a digital token instantly.",
    step: "02",
  },
  {
    icon: Radio,
    title: "Track & get served",
    description:
      "Monitor your queue position in real time. Receive notifications when it's your turn — no more waiting in line.",
    step: "03",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      id="how-it-works"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          How QueueLess Works
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Three simple steps to skip the wait
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <div key={step.step} className="relative text-center">
            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div
                className="absolute right-0 top-10 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-primary/30 to-primary/10 md:block"
                aria-hidden="true"
              />
            )}
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <step.icon className="h-9 w-9" />
              <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
                {step.step}
              </span>
            </div>
            <h3 className="mt-6 text-lg font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
