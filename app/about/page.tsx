import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Switch-to.EU | EU Digital Service Alternatives',
  description: 'Learn about the Switch-to.EU platform, our mission to promote digital sovereignty, and how we help users migrate to EU-based alternatives.',
  keywords: ['about switch-to.eu', 'digital sovereignty', 'EU alternatives', 'community platform', 'data privacy'],
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">About Switch-to.EU</h1>
      <div className="prose lg:prose-xl dark:prose-invert">
        <p>
          Switch-to.EU is a community-driven platform that helps users easily switch from non-EU digital
          services to EU alternatives through clear, step-by-step migration guides.
        </p>
        <p>
          Our goal is to promote digital sovereignty and data privacy by making it easier for users to
          find and migrate to services hosted within the European Union.
        </p>
        <h2>Why EU Services?</h2>
        <p>
          European services often operate under stricter privacy regulations like GDPR, providing users
          with greater control over their personal data and enhanced privacy protections.
        </p>
        <h2>Community-Driven</h2>
        <p>
          This platform is built by the community, for the community. All our guides and service listings
          are maintained through open collaboration, and we welcome contributions from anyone interested
          in promoting EU digital services.
        </p>
      </div>
    </main>
  );
}