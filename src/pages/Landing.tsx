import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Destinations } from '@/components/landing/Destinations';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';

export default function Landing() {
  return (
    <>
      <Hero />
      <Features />
      <Destinations />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
