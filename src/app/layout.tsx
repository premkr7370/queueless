import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "QueueLess — Find your service. Book your spot. Skip the wait.",
    template: "%s | QueueLess",
  },
  description:
    "Discover trusted local businesses, book appointments, and track your queue in real time. QueueLess connects you with clinics, salons, spas, and more.",
  keywords: [
    "queue management",
    "appointment booking",
    "local services",
    "virtual queue",
    "clinic booking",
    "salon booking",
  ],
  openGraph: {
    title: "QueueLess — Find your service. Book your spot. Skip the wait.",
    description:
      "Discover trusted local businesses, book appointments, and track your queue in real time.",
    type: "website",
    siteName: "QueueLess",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
