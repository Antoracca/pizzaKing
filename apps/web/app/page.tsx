import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedPizzas from '@/components/home/FeaturedPizzas';
import MealBundles from '@/components/home/MealBundles';
import HowItWorks from '@/components/home/HowItWorks';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturedPizzas />
      <MealBundles />
      <HowItWorks />
      <Footer />
    </main>
  );
}
