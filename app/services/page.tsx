import { getEUServices } from "@/lib/content";
import { Container } from "@/components/layout/container";
import { Metadata } from 'next';
import { ContributeCta } from "@/components/ContributeCta";
import { CategorySection } from "@/components/CategorySection";
import { ServiceCard } from "@/components/ui/ServiceCard";

export const metadata: Metadata = {
  title: 'EU Service Alternatives | switch-to.eu',
  description: 'Discover EU-based alternatives to popular digital services that respect your privacy, follow GDPR, and keep your data in Europe.',
  keywords: ['EU services', 'European alternatives', 'privacy-focused services', 'GDPR compliant', 'ethical tech'],
};

export default async function ServicesPage() {

  // Get featured EU services
  const allEUServices = await getEUServices();
  const featuredEUServices = allEUServices
    .filter(service => service.featured === true)
    .map(service => ({
      service,
      category: service.category
    }));

  return (
    <main className="flex flex-col gap-16 py-10 md:gap-24 md:py-16">

      {/* Hero Section */}
      <section>
        <Container className="flex flex-col items-center gap-6 text-center">
          <h1 className="font-bold text-4xl md:text-5xl">EU Service Alternatives</h1>
          <p className="max-w-[650px] text-lg text-muted-foreground md:text-xl">
            Discover EU-based alternatives to popular digital services that respect your privacy, follow GDPR, and keep your data in Europe.
          </p>
        </Container>
      </section>

      {/* Featured Alternatives */}
      {featuredEUServices.length > 0 && (
        <section>
          <Container>
            <h2 className="mb-8 text-center font-bold text-3xl">Featured Alternatives</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {featuredEUServices.map((item) => (
                <ServiceCard key={item.service.name} service={item.service} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Categories Section */}
      <CategorySection />

      {/* CTA Section */}
      <section className="py-8 md:py-12">
        <Container>
          <ContributeCta />
        </Container>
      </section>
    </main>
  );
}