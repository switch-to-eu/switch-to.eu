import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { InlineSearchInput } from "@/components/InlineSearchInput";
import { Metadata } from 'next';
import { ContributeCta } from "@/components/ContributeCta";
import { CategorySection } from "@/components/CategorySection";

export const metadata: Metadata = {
  title: 'switch-to.eu - EU alternatives to global services',
  description: 'A guide to help you switch from non-EU to EU-based digital services and products. Privacy-focused, GDPR-compliant alternatives for all your digital needs.',
  keywords: ['EU alternatives', 'European digital services', 'privacy', 'GDPR', 'digital migration', 'data protection', 'EU tech'],
};

export default function Home() {
  const imageSize = 120;

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      {/* Hero Section */}
      <section className="relative">
        <Container className="flex flex-col md:mt-6 md:mb-6 md:flex-row items-center gap-6 sm:gap-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl ">
              TAKE CONTROL OF YOUR DIGITAL SERVICES
            </h1>
            <p className="text-base sm:text-lg md:text-xl  mt-4 sm:mt-6 ">
              Switch to <b>EU-based alternatives</b> that respect your privacy,
              follow GDPR, and keep your data in Europe
            </p>
            <p className="text-base sm:text-lg md:text-xl max-w-[500px]">
              Enter a service that you want to move away and we will help you <b>make the switch!</b>
            </p>

            {/* Search CTA */}
            <div className="w-full ">
              <InlineSearchInput
                filterRegion="non-eu"
                showOnlyServices={true}
              />
            </div>
            <p className="text-base sm:text-lg md:text-xl  mb -2 sm:mb-3 max-w-[500px]">
              For example: <Link href="/services/non-eu/whatsapp" className="text-blue underline">WhatsApp</Link>,&nbsp;
              <Link href="/services/non-eu/gmail" className="text-blue underline">Gmail</Link> or&nbsp;
              <Link href="/services/non-eu/google-drive" className="text-blue underline">Google Drive</Link>
            </p>
          </div>

          <div className="relative w-full max-w-[300px] sm:max-w-[400px] h-[250px] sm:h-[300px] mt-4 sm:mt-0">
            <Image
              src="/images/europe.svg"
              alt="Europe map illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section>
        <Container>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <div className="bg-[var(--pop-1)] p-5 sm:p-8 rounded-xl sm:translate-y-[10px]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-01.svg"
                    alt="Europe map illustration"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">European Alternativess</h3>
                <p className=" text-sm sm:text-base">
                  Discover a curated collection of EU-based digital services that respect your privacy and align with European values. Each alternative is thoroughly evaluated for functionality, reliability, and compliance with EU regulations.
                </p>
              </div>
            </div>
            <div className="bg-[var(--pop-2)] p-5 sm:p-8 rounded-xl sm:translate-y-[-20px]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-02.svg"
                    alt="Europe map illustration"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">Step-by-step Guides</h3>
                <p className=" text-sm sm:text-base">
                  Follow our clear, detailed migration instructions to seamlessly transition from global services to European alternatives. Our guides break down complex processes into manageable steps anyone can follow.                </p>
              </div>
            </div>
            <div className="bg-[var(--pop-3)] p-5 sm:p-8 rounded-xl">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-03.svg"
                    alt="Europe map illustration"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">Community Driven</h3>
                <p className=" text-sm sm:text-base">
                  Our platform thrives on user participation. Anyone can contribute by adding new services, creating or improving migration guides, and sharing their experiences. This collaborative approach ensures our content stays relevant, accurate, and comprehensive.                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Switch Section */}
      <section className="py-16">
        <Container>
          <h2 className="mb-6 text-center font-bold text-3xl ">Why switch to Europe-based services?</h2>
          <p className="text-center text-lg max-w-[800px] mx-auto mb-4 ">
            Use EU-based digital alternatives that comply with GDPR, ensuring your data is processed with transparency and security.
          </p>
          <p className="text-center text-lg max-w-[800px] mx-auto ">
            Support the local tech ecosystem and contribute to a fairer digital economy.
          </p>
          <div className="mt-8 text-center">
            <Button variant="red" asChild className="mx-auto">
              <Link href="/about">Want to know more?</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Categories Section */}
      <CategorySection />
      <div className="text-center mt-[-2em]">
        <Button asChild>
          <Link href="/services">View All Services</Link>
        </Button>
      </div>

      {/* CTA Section */}
      <section className="py-8 md:py-12">
        <Container>
          <ContributeCta />
        </Container>
      </section>
    </div>
  );
}
