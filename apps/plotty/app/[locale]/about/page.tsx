import { Link } from "@switch-to-eu/i18n/navigation";
import Image from "next/image";

import {
  Shield,
  MapPin,
  Zap,
  Eye,
  Server,
  Lock,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Globe,
  Database,
  Wifi
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@switch-to-eu/ui/components/card";

import { ToolShowcase } from "../../../components/tool-showcase";
import { useTranslations } from "next-intl";
import { colors } from "../../../global";

export default function AboutPage() {
  const t = useTranslations('AboutPage');

  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
        <div className={`absolute inset-0 ${colors.gradients.heroBg}`}></div>

        <div className="relative z-10 container mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="mb-6 text-5xl font-bold sm:mb-8 sm:text-6xl lg:text-7xl">
              <span className={`${colors.gradients.primary} bg-clip-text text-transparent`}>
                {t('hero.title')}
              </span>
            </h1>

            <p className="mx-auto mb-8 max-w-3xl text-xl text-neutral-600 sm:mb-10 sm:text-2xl">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-lg">
              <div className="flex items-center gap-2 text-neutral-700">
                <MapPin className="h-5 w-5 text-primary-color" />
                {t('hero.badges.european')}
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <Shield className="h-5 w-5 text-green-600" />
                {t('hero.badges.encrypted')}
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <Eye className="h-5 w-5 text-primary-color" />
                {t('hero.badges.noTracking')}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* About Plotty Section */}
      <div className={`${colors.backgrounds.light} py-16 sm:py-20`}>
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="mb-4 text-4xl font-bold text-neutral-900 sm:text-5xl">
              {t('plotty.title')}
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-neutral-600">
              {t('plotty.subtitle')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Card className="border-0 bg-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Clock className="h-6 w-6 text-primary-color" />
                </div>
                <CardTitle className="text-xl text-neutral-900">
                  {t('plotty.features.instant.title')}
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  {t('plotty.features.instant.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 bg-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl text-neutral-900">
                  {t('plotty.features.realtime.title')}
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  {t('plotty.features.realtime.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 bg-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Shield className="h-6 w-6 text-primary-color" />
                </div>
                <CardTitle className="text-xl text-neutral-900">
                  {t('plotty.features.private.title')}
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  {t('plotty.features.private.description')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Perfect For Section */}
          <div className="mt-16 text-center">
            <h3 className="mb-8 text-3xl font-bold text-neutral-900">
              {t('plotty.perfectFor.title')}
            </h3>

            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              <div className="text-center">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${colors.gradients.primary}`}>
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">{t('plotty.perfectFor.teams.title')}</h4>
                <p className="text-sm text-neutral-600">{t('plotty.perfectFor.teams.description')}</p>
              </div>

              <div className="text-center">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${colors.gradients.secondary}`}>
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">{t('plotty.perfectFor.events.title')}</h4>
                <p className="text-sm text-neutral-600">{t('plotty.perfectFor.events.description')}</p>
              </div>

              <div className="text-center">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${colors.gradients.accent}`}>
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">{t('plotty.perfectFor.privacy.title')}</h4>
                <p className="text-sm text-neutral-600">{t('plotty.perfectFor.privacy.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Deep Dive Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="mb-4 text-4xl font-bold text-neutral-900 sm:text-5xl">
              {t('technical.title')}
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-neutral-600">
              {t('technical.subtitle')}
            </p>
          </div>

          {/* Architecture Overview */}
          <div className="mb-16">
            <div className={`${colors.backgrounds.soft} rounded-2xl p-8 border border-blue-100`}>
              <h3 className="text-2xl font-bold text-center text-neutral-900 mb-8">
                {t('technical.architecture.title')}
              </h3>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Lock className="h-6 w-6 text-primary-color" />
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-2">{t('technical.architecture.encryption.title')}</h4>
                  <p className="text-sm text-neutral-600">{t('technical.architecture.encryption.description')}</p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Wifi className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-2">{t('technical.architecture.realtime.title')}</h4>
                  <p className="text-sm text-neutral-600">{t('technical.architecture.realtime.description')}</p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <Database className="h-6 w-6 text-primary-color" />
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-2">{t('technical.architecture.storage.title')}</h4>
                  <p className="text-sm text-neutral-600">{t('technical.architecture.storage.description')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details Grid */}
          <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-6 w-6 text-primary-color" />
                  <CardTitle className="text-xl text-neutral-900">
                    {t('technical.details.security.title')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-neutral-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.security.encryption')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.security.zeroKnowledge')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.security.autoDelete')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.security.noTracking')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="h-6 w-6 text-green-600" />
                  <CardTitle className="text-xl text-neutral-900">
                    {t('technical.details.performance.title')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-neutral-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.performance.sse')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.performance.trpc')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.performance.optimistic')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.performance.responsive')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-6 w-6 text-primary-color" />
                  <CardTitle className="text-xl text-neutral-900">
                    {t('technical.details.scheduling.title')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-neutral-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.scheduling.flexible')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.scheduling.multiple')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.scheduling.granular')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.scheduling.optimal')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Server className="h-6 w-6 text-orange-600" />
                  <CardTitle className="text-xl text-neutral-900">
                    {t('technical.details.modern.title')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-neutral-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.modern.nextjs')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.modern.database')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.modern.typescript')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.modern.hosting')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Open Source Section */}
      <div className={`${colors.backgrounds.subtle} py-16 sm:py-20`}>
        <div className="container mx-auto">
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <h2 className="mb-4 text-4xl font-bold text-neutral-900 sm:text-5xl">
              {t('openSource.title')}
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-neutral-600 mb-8">
              {t('openSource.description')}
            </p>

            <a
              href="https://github.com/switch-to-eu/tools-mono"
              className="inline-block mb-8 h-10 rounded-md px-6 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-all inline-flex items-center justify-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe className="mr-3 h-6 w-6" />
              {t('openSource.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>

            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">{t('openSource.benefits.transparency.title')}</h4>
                <p className="text-sm text-neutral-600">{t('openSource.benefits.transparency.description')}</p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Users className="h-6 w-6 text-primary-color" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">{t('openSource.benefits.community.title')}</h4>
                <p className="text-sm text-neutral-600">{t('openSource.benefits.community.description')}</p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Shield className="h-6 w-6 text-primary-color" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">{t('openSource.benefits.security.title')}</h4>
                <p className="text-sm text-neutral-600">{t('openSource.benefits.security.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Switch-to.eu Platform Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="mb-4 text-4xl font-bold text-neutral-900 sm:text-5xl">
              {t('platform.title')}
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-neutral-600">
              {t('platform.description')}
            </p>
          </div>

          {/* Tool Showcase */}
          <div className="mb-16">
            <ToolShowcase />
          </div>

          {/* Platform Benefits */}
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto mb-12">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-2">{t('platform.benefits.sovereignty.title')}</h4>
              <p className="text-sm text-neutral-600">{t('platform.benefits.sovereignty.description')}</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Lock className="h-6 w-6 text-primary-color" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-2">{t('platform.benefits.privacy.title')}</h4>
              <p className="text-sm text-neutral-600">{t('platform.benefits.privacy.description')}</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Zap className="h-6 w-6 text-primary-color" />
              </div>
              <h4 className="font-semibold text-neutral-900 mb-2">{t('platform.benefits.innovation.title')}</h4>
              <p className="text-sm text-neutral-600">{t('platform.benefits.innovation.description')}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <a
              href="https://switch-to.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 rounded-md px-6 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-all"
            >
              {t('platform.cta')}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`relative overflow-hidden ${colors.gradients.primaryExtended} py-16 sm:py-20`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
            {t('cta.title')}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90 sm:mb-10">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/create"
              className="inline-block bg-white text-primary-color shadow-xl transition-all hover:scale-105 hover:bg-neutral-100 px-8 py-4 text-lg font-semibold h-auto rounded-md inline-flex items-center justify-center gap-2"
            >
              <Shield className="mr-3 h-6 w-6" />
              {t('cta.createPoll')}
            </a>
            <a
              href="/"
              className="inline-block border-white text-white hover:bg-white hover:text-primary-color px-8 py-4 text-lg font-semibold h-auto rounded-md inline-flex items-center justify-center gap-2 border bg-transparent shadow-xs transition-all"
            >
              {t('cta.learnMore')}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
