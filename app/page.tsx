import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/sections/hero';
import { Discover } from '@/components/sections/discover';
import { Categories } from '@/components/sections/categories';
import { Properties } from '@/components/sections/properties';
import { ServicesSection } from '@/components/sections/services-section';
import { ValueProposition } from '@/components/sections/value-proposition';
import { Storytelling } from '@/components/sections/storytelling';
import { Partners } from '@/components/sections/partners';
import { Testimonials } from '@/components/sections/testimonials';
import { FinalCTA } from '@/components/sections/final-cta';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Discover />
        <Categories />
        <Properties />
        <ServicesSection />
        <ValueProposition />
        <Storytelling />
        <Partners />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
