import { Metadata } from 'next';
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About Switch-to.EU | EU Digital Service Alternatives',
  description: 'Learn about the Switch-to.EU platform, our mission to promote digital sovereignty, and how we help users migrate to EU-based alternatives.',
  keywords: ['about switch-to.eu', 'digital sovereignty', 'EU alternatives', 'community platform', 'data privacy'],
};

export default function AboutPage() {
  const imageSize = 120;

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      {/* Hero Section */}
      <section>
        <Container>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6">About Switch-to.EU</h1>
              <p className="text-base sm:text-lg mb-6">
                Switch-to.EU is a community-driven platform that helps users easily switch from non-EU digital
                services to EU alternatives through clear, step-by-step migration guides.
              </p>
              <p className="text-base sm:text-lg mb-6">
                Our goal is to promote digital sovereignty and data privacy by making it easier for users to
                find and migrate to services hosted within the European Union.
              </p>
            </div>
            <div className="w-full max-w-[300px] h-[200px] relative flex-shrink-0">
              <Image
                src="/images/europe.svg"
                alt="Europe map illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Three Pillars Section */}
      <section>
        <Container>
          <h2 className="mb-8 text-center font-bold text-3xl">Our Three Pillars</h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <div className="bg-[var(--pop-1)] p-5 sm:p-8 rounded-xl sm:translate-y-[10px]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-01.svg"
                    alt="European Alternatives icon"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">European Alternatives</h3>
                <p className="text-sm sm:text-base">
                  We curate and maintain a comprehensive directory of EU-based digital services across various
                  categories - from email providers and cloud storage to social media and productivity tools.
                </p>
              </div>
            </div>
            <div className="bg-[var(--pop-2)] p-5 sm:p-8 rounded-xl sm:translate-y-[-20px]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-02.svg"
                    alt="Step-by-step Guides icon"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">Step-by-Step Guides</h3>
                <p className="text-sm sm:text-base">
                  We provide detailed, user-friendly migration guides that walk you through the process of moving
                  your data and digital life from global services to European alternatives.
                </p>
              </div>
            </div>
            <div className="bg-[var(--pop-3)] p-5 sm:p-8 rounded-xl">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-03.svg"
                    alt="Community Driven icon"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">Community Driven</h3>
                <p className="text-sm sm:text-base">
                  This platform is built by the community, for the community. All our guides and service listings
                  are maintained through open collaboration, and we welcome contributions from anyone interested
                  in promoting EU digital services.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Choose EU Services Section */}
      <section>
        <Container>
          <h2 className="mb-8 text-center font-bold text-3xl">Why Choose EU-Based Digital Services?</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-[var(--pop-4)] p-5 rounded-xl">
              <h3 className="mb-3 font-bold text-xl text-center">Data Privacy & Protection</h3>
              <p className="text-sm sm:text-base">
                EU-based digital services operate under the stringent General Data Protection Regulation (GDPR),
                giving you greater control over your personal data. Your information is treated as your property,
                not a commodity to be sold or shared without your explicit consent.
              </p>
            </div>

            <div className="bg-[var(--pop-1)] p-5 rounded-xl">
              <h3 className="mb-3 font-bold text-xl text-center">Ethical Business Practices</h3>
              <p className="text-sm sm:text-base">
                European digital services often prioritize sustainable and ethical business models that don&apos;t
                rely heavily on surveillance capitalism. Instead of monetizing your attention and personal
                information, many EU alternatives focus on providing quality services through transparent
                subscription models.
              </p>
            </div>

            <div className="bg-[var(--pop-2)] p-5 rounded-xl">
              <h3 className="mb-3 font-bold text-xl text-center">Digital Sovereignty</h3>
              <p className="text-sm sm:text-base">
                Using EU-based services helps reduce dependence on big tech monopolies and supports a more
                diverse digital ecosystem. This contributes to technological independence for Europe and
                promotes innovation through healthy competition.
              </p>
            </div>

            <div className="bg-[var(--pop-3)] p-5 rounded-xl">
              <h3 className="mb-3 font-bold text-xl text-center">Consumer Rights</h3>
              <p className="text-sm sm:text-base">
                The EU has established some of the world&apos;s strongest consumer protection laws in the digital realm.
                When using EU-based services, you benefit from clear terms of service, transparent pricing, and
                robust mechanisms for dispute resolution if something goes wrong.
              </p>
            </div>

            <div className="bg-[var(--pop-1)] p-5 rounded-xl">
              <h3 className="mb-3 font-bold text-xl text-center">Supporting European Innovation</h3>
              <p className="text-sm sm:text-base">
                By choosing EU alternatives, you&apos;re directly supporting European startups, developers, and digital
                innovators. This helps create jobs, foster technological advancement within Europe, and build a
                stronger digital economy that reflects European values and priorities.
              </p>
            </div>

            <div className="bg-[var(--pop-2)] p-5 rounded-xl">
              <h3 className="mb-3 font-bold text-xl text-center">Alignment with European Values</h3>
              <p className="text-sm sm:text-base">
                EU digital services are designed within a framework that prioritizes human dignity, freedom,
                equality, and respect for human rights. These fundamental values shape how services are built
                and operated, creating digital spaces that better reflect the European approach.
              </p>
            </div>
          </div>
        </Container>
      </section>


      {/* Join Our Mission Section */}
      <section className="py-8">
        <Container>
          <div className="text-center max-w-[800px] mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Join Our Mission</h2>
            <p className="text-base sm:text-lg mb-4">
              Digital sovereignty isn&apos;t just about where your data is stored—it&apos;s about having genuine choice
              and control in your digital life. By switching to EU-based services, you&apos;re taking an important
              step toward a more balanced, user-respecting digital ecosystem.
            </p>
            <p className="text-base sm:text-lg mb-4">
              Join us in building a stronger European digital landscape that puts users first.
            </p>
          </div>
        </Container>
      </section>

      {/* How You Can Contribute Section */}
      <section className="">
        <Container>
          <h2 className="mb-10 text-center font-bold text-3xl">We Need Your Help</h2>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex justify-center mb-6">
                <div className="bg-[#e9f5ff] rounded-full p-4 w-20 h-20 flex items-center justify-center">
                  <Image
                    src="/images/icon-02.svg"
                    alt="Share Your Migration Knowledge"
                    width={40}
                    height={40}
                  />
                </div>
              </div>
              <h3 className="mb-4 font-bold text-xl text-center">Share Your Migration Knowledge</h3>
              <p className="mb-6 text-base">
                Do you have experience switching to EU-based services? Your insights could help countless
                others make the same journey. We need detailed, user-friendly migration guides.
              </p>

            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex justify-center mb-6">
                <div className="bg-[#ffe9e9] rounded-full p-4 w-20 h-20 flex items-center justify-center">
                  <Image
                    src="/images/icon-01.svg"
                    alt="Be a Guide Tester"
                    width={40}
                    height={40}
                  />
                </div>
              </div>
              <h3 className="mb-4 font-bold text-xl text-center">Be a Guide Tester</h3>
              <p className="mb-6 text-base">
                Even if you haven&apos;t made the switch yet, you can help by testing our existing guides.
                Your fresh perspective helps identify confusing steps or missing information.
              </p>

            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex justify-center mb-6">
                <div className="bg-[#e8fff5] rounded-full p-4 w-20 h-20 flex items-center justify-center">
                  <Image
                    src="/images/icon-03.svg"
                    alt="Discover EU Alternatives"
                    width={40}
                    height={40}
                  />
                </div>
              </div>
              <h3 className="mb-4 font-bold text-xl text-center">Discover EU Alternatives</h3>
              <p className="mb-6 text-base">
                Help us expand our catalog of European digital services. Research and document
                EU-based alternatives to popular international services.
              </p>

            </div>

          </div>
          <div className="flex justify-center mt-6">
            <Button variant="red" className="font-medium">
              <Link href="/contribute">
                Contribute to Switch-to.EU
              </Link>
            </Button>
          </div>
        </Container>
      </section>

    </div>
  );
}