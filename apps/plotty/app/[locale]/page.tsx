import { Link } from "@switch-to-eu/i18n/navigation";
import Image from "next/image";

import { Shield, CheckCircle, Lock } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@switch-to-eu/ui/components/card";

import { Button } from "@switch-to-eu/ui/components/button";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations('HomePage');

  return (
    <>
      {/* Hero Section - With Screenshot */}
      <div className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-white"></div>

        <div className="relative z-10 container mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <h1 className="mb-6 text-5xl font-bold sm:mb-8 sm:text-6xl lg:text-7xl">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {t('hero.title')}
                </span>
                <br />
                <span className="text-neutral-900">{t('hero.subtitle')}</span>
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-xl text-neutral-600 sm:mb-10 sm:text-2xl lg:mx-0">
                {t('hero.description')}
              </p>

              <div className="inline-block">
                <Link href="/create" className="inline-block">
                  <Button
                    variant="default"
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold shadow-xl transition-all hover:scale-105"
                  >
                    <Shield className="mr-3 h-6 w-6" />
                    <span className="hidden sm:inline">{t('hero.cta')}</span>
                    <span className="sm:hidden">{t('hero.ctaMobile')}</span>
                  </Button>
                </Link>
                <p className="mt-2 text-sm text-neutral-500 text-left">
                  {t('hero.disclaimer')}
                </p>
              </div>
            </div>

            {/* Hero Screenshot */}
            <div className="relative">
              <div className="relative rounded-lg shadow-2xl overflow-hidden border border-white/20">
                <Image
                  src="/screenshots/hero-create-poll.png"
                  alt="Simple poll creation interface - no signup required"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                  priority
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-full px-4 py-2 shadow-lg border border-green-200">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  {t('hero.floatingBadge')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges - New Section */}
      <div className="bg-white py-8 sm:py-12">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {t('trust.badges.noEmail')}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {t('trust.badges.autoDelete')}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {t('trust.badges.encrypted')}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {t('trust.badges.european')}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section - Simplified to 2 cards */}
      <div className="bg-neutral-50 py-16 sm:py-20">
        <div className="container mx-auto">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-4xl font-bold text-neutral-900 sm:text-5xl">
              {t('benefits.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-neutral-600">
              {t('benefits.description')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <Card className="border-0 bg-gradient-to-br from-white to-green-50 shadow-lg transition-all hover:scale-105 hover:shadow-xl p-8">
              <CardHeader className="text-center p-0">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-600">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-neutral-900 mb-4">
                  {t('benefits.privacy.title')}
                </CardTitle>
                <CardDescription className="text-lg text-neutral-600">
                  {t('benefits.privacy.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-white to-yellow-50 shadow-lg transition-all hover:scale-105 hover:shadow-xl p-8 relative overflow-hidden">
              <CardHeader className="text-center p-0 relative z-10">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-neutral-900 mb-4">
                  {t('benefits.european.title')}
                </CardTitle>
                <CardDescription className="text-lg text-neutral-600 mb-6">
                  {t('benefits.european.description')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section - Simplified to 2 steps */}
      <div className="py-16 sm:py-20">
        <div className="container mx-auto">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-4xl font-bold text-neutral-900 sm:text-5xl">
              {t('howItWorks.title')}
            </h2>
            <p className="text-xl text-neutral-600">
              {t('howItWorks.description')}
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-2 max-w-5xl mx-auto">
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg transition-transform group-hover:scale-110">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="mb-4 text-2xl font-semibold text-neutral-900">
                {t('howItWorks.step1.title')}
              </h3>
              <p className="text-lg text-neutral-600 mb-6">
                {t('howItWorks.step1.description')}
              </p>

              {/* Timeslots Feature Screenshot */}
              <div className="rounded-lg overflow-hidden shadow-lg border border-neutral-200">
                <Image
                  src="/screenshots/timeslots.png"
                  alt="Optional time-based scheduling with specific time slots"
                  width={400}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-neutral-500 mt-2">{t('howItWorks.step1.caption')}</p>
            </div>

            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-600 shadow-lg transition-transform group-hover:scale-110">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="mb-4 text-2xl font-semibold text-neutral-900">
                {t('howItWorks.step2.title')}
              </h3>
              <p className="text-lg text-neutral-600 mb-6">
                {t('howItWorks.step2.description')}
              </p>

              {/* Voting Results Screenshot */}
              <div className="rounded-lg overflow-hidden shadow-lg border border-neutral-200">
                <Image
                  src="/screenshots/step2-voting.png"
                  alt="Clean voting interface with participant responses"
                  width={400}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-neutral-500 mt-2">{t('howItWorks.step2.caption')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Strengthened */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-green-500 py-16 sm:py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
            {t('cta.title')}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90 sm:mb-10">
            {t('cta.description')}
          </p>
          <div className="inline-block">
            <Link href="/create" className="inline-block">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-primary-color shadow-xl transition-all hover:scale-105 hover:bg-neutral-100 px-8 py-4 text-lg font-semibold"
              >
                <Shield className="mr-3 h-6 w-6" />
                <span className="hidden sm:inline">{t('cta.button')}</span>
                <span className="sm:hidden">{t('cta.buttonMobile')}</span>
              </Button>
            </Link>
            <p className="mt-2 text-sm text-white/70 text-center">
              {t('hero.disclaimer')}
            </p>
          </div>
        </div>
      </div>

    </>
  );
}
