import { Metadata } from 'next';
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: 'Contribute to Switch-to.EU | Help Build EU Alternatives',
  description: 'Learn how to contribute to Switch-to.EU by adding migration guides, service alternatives, and helping grow our community-driven platform.',
  keywords: ['contribute', 'open source', 'EU alternatives', 'migration guides', 'community collaboration'],
};

export default function ContributePage() {
  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      {/* Hero Section */}
      <section>
        <Container>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-[#1a3c5a]">Join the Switch-to.EU Community</h1>
              <p className="text-base sm:text-lg text-[#334155] mb-6">
                Your expertise can help Europeans reclaim their digital sovereignty! Switch-to.EU empowers users to migrate from big tech services to European alternatives, and we need your help to grow this movement.
              </p>
            </div>
            <div className="w-full max-w-[300px] h-[200px] relative flex-shrink-0">
              <Image
                src="/images/contribute.svg"
                alt="Contribution illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Contribution Cards Section */}
      <section>
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-[#1a3c5a]">We Need Your Help</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="bg-[var(--pop-1)] rounded-full p-4">
                    <Image
                      src="/images/icon-01.svg"
                      alt="Share Your Migration Knowledge"
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">Share Your Migration Knowledge</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#334155] text-center">
                  Do you have experience switching to EU-based services? Your insights could help countless others make the same journey. We need detailed, user-friendly migration guides.
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Link href="/contribute/guide" className="text-blue-600 hover:underline">
                  Create a Guide →
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="bg-[var(--pop-2)] rounded-full p-4">
                    <Image
                      src="/images/icon-02.svg"
                      alt="Be a Guide Tester"
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">Be a Guide Tester</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#334155] text-center">
                  Even if you haven&apos;t made the switch yet, you can help by testing our existing guides. Your fresh perspective helps identify confusing steps or missing information.
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Link href="https://github.com/switch-to-eu/content/issues/new" target="_blank" className="text-blue-600 hover:underline">
                  Give guide feedback →
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="bg-[var(--pop-3)] rounded-full p-4">
                    <Image
                      src="/images/icon-03.svg"
                      alt="Discover EU Alternatives"
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">Discover EU Alternatives</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#334155] text-center">
                  Help us expand our catalog of European digital services. Research and document EU-based alternatives to popular international services.
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Link href="https://github.com/switch-to-eu/content/issues/new" target="_blank" className="text-blue-600 hover:underline">
                  Add a Service →
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="bg-[var(--pop-4)] rounded-full p-4">
                    <Image
                      src="/images/icon-01.svg"
                      alt="Lend Your Technical Skills"
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">Lend Your Technical Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#334155] text-center">
                  Are you a developer? Our platform needs continuous improvement to serve our growing community. From fixing bugs to implementing new features.
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Link href="https://github.com/switch-to-eu/switch-to.eu/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View GitHub Repository →
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="bg-[var(--pop-1)] rounded-full p-4">
                    <Image
                      src="/images/icon-02.svg"
                      alt="Bring Your Ideas"
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">Bring Your Ideas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#334155] text-center">
                  Have suggestions for improving Switch-to.EU? Your insights can shape the future of our platform and help us better serve the European digital community.
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Link href="https://github.com/switch-to-eu/switch-to.eu/issues/new" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Submit Feedback →
                </Link>
              </CardFooter>
            </Card>
          </div>
        </Container>
      </section>

      {/* Why Your Contribution Matters Section */}
      <section>
        <Container>
          <div className="bg-[#e8fff5] p-6 sm:p-10 rounded-xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#1a3c5a]">Why Your Contribution Matters</h2>
            <p className="text-[#334155] text-base sm:text-lg max-w-[800px] mx-auto mb-6">
              Every contribution, big or small, strengthens digital independence in Europe. By helping others make informed choices about their digital services, you&apos;re supporting privacy, data protection, and the European digital economy.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}