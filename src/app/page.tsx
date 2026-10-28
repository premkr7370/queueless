import { Header, Footer } from "@/components/layout";
import {
  HeroSection,
  CategoriesSection,
  FeaturedBusinessesSection,
  HowItWorksSection,
  LiveQueuePreview,
  WhyChooseSection,
  BusinessOwnerCTA,
  FAQSection,
} from "@/components/marketing";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <FeaturedBusinessesSection />
        <HowItWorksSection />
        <LiveQueuePreview />
        <WhyChooseSection />
        <BusinessOwnerCTA />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
