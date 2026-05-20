import SEO               from '@/components/common/SEO';
import HeroSection        from '@/components/sections/HeroSection';
import AboutSection       from '@/components/sections/AboutSection';
import ServicesSection    from '@/components/sections/ServicesSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import PricingSection     from '@/components/sections/PricingSection';
import BlogSection        from '@/components/sections/BlogSection';
import ContactSection     from '@/components/sections/ContactSection';
import CTASection         from '@/components/sections/CTASection';
import StatsBar           from '@/components/sections/StatsBar';

function Home() {
  return (
    <>
      <SEO />
      <HeroSection />
      <StatsBar />
      <AboutSection />
      <ServicesSection />
      <TestimonialsSection />
      <PricingSection />
      <BlogSection />
      <ContactSection />
      <CTASection />
    </>
  );
}

export default Home;
