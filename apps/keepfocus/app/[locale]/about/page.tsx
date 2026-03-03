import {
  Shield,
  MapPin,
  Zap,
  Eye,
  Server,
  Lock,
  Users,
  CheckCircle,
  ArrowRight,
  Globe,
  Database,
  Timer,
  Target,
  Brain
} from "lucide-react";

import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations('AboutPage');

  return (
    <div className="flex flex-col gap-8 sm:gap-12 md:gap-16 py-8 sm:py-12">

      {/* Hero Section - Navy dark block */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="bg-brand-navy rounded-3xl relative overflow-hidden">
          <div className="relative z-10 px-6 sm:px-10 md:px-16 py-12 sm:py-16">
            {/* Decorative shapes */}
            <div
              className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-brand-sky/15 animate-shape-float pointer-events-none"
              aria-hidden="true"
              style={{ animationDuration: '8s' }}
            />
            <div
              className="absolute -bottom-8 -left-8 w-40 h-40 bg-brand-yellow/10 animate-shape-float pointer-events-none"
              aria-hidden="true"
              style={{
                borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                animationDuration: '9s',
                animationDelay: '-3s'
              }}
            />
            <div
              className="absolute top-1/4 -left-4 w-16 h-16 bg-brand-pink/10 rotate-45 animate-shape-float pointer-events-none"
              aria-hidden="true"
              style={{ animationDuration: '7s', animationDelay: '-1.5s' }}
            />

            <div className="text-center max-w-4xl mx-auto">
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl uppercase text-brand-yellow mb-6 sm:mb-8">
                {t('hero.title')}
              </h1>

              <p className="mx-auto mb-8 max-w-3xl text-xl sm:text-2xl text-brand-sky">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-base">
                <div className="flex items-center gap-2 bg-white/10 text-white rounded-full px-4 py-2">
                  <MapPin className="h-5 w-5 text-brand-yellow" />
                  {t('hero.badges.european')}
                </div>
                <div className="flex items-center gap-2 bg-white/10 text-white rounded-full px-4 py-2">
                  <Shield className="h-5 w-5 text-brand-yellow" />
                  {t('hero.badges.localData')}
                </div>
                <div className="flex items-center gap-2 bg-white/10 text-white rounded-full px-4 py-2">
                  <Eye className="h-5 w-5 text-brand-yellow" />
                  {t('hero.badges.noTracking')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About KeepFocus Section - Feature cards with brand colors */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-heading text-4xl sm:text-5xl uppercase text-brand-green mb-4">
            {t('keepfocus.title')}
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
            {t('keepfocus.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* Pomodoro card - Sky background */}
          <div className="bg-brand-sky rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/20">
              <Timer className="h-6 w-6 text-brand-green" />
            </div>
            <h3 className="font-heading text-2xl uppercase text-brand-green">
              {t('keepfocus.features.pomodoro.title')}
            </h3>
            <p className="text-brand-green/80 text-sm leading-relaxed">
              {t('keepfocus.features.pomodoro.description')}
            </p>
          </div>

          {/* Tasks card - Yellow background */}
          <div className="bg-brand-yellow rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/20">
              <Target className="h-6 w-6 text-brand-green" />
            </div>
            <h3 className="font-heading text-2xl uppercase text-brand-green">
              {t('keepfocus.features.tasks.title')}
            </h3>
            <p className="text-brand-green/80 text-sm leading-relaxed">
              {t('keepfocus.features.tasks.description')}
            </p>
          </div>

          {/* Focus card - Navy background */}
          <div className="bg-brand-navy rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Brain className="h-6 w-6 text-brand-yellow" />
            </div>
            <h3 className="font-heading text-2xl uppercase text-brand-yellow">
              {t('keepfocus.features.focus.title')}
            </h3>
            <p className="text-brand-sky text-sm leading-relaxed">
              {t('keepfocus.features.focus.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Technical Deep Dive Section - Green dark block */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="bg-brand-green rounded-3xl relative overflow-hidden">
          <div className="relative z-10 px-6 sm:px-10 md:px-16 py-12 sm:py-16">
            {/* Decorative shapes */}
            <div
              className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-brand-yellow/10 animate-shape-float pointer-events-none"
              aria-hidden="true"
              style={{ animationDuration: '9s' }}
            />
            <div
              className="absolute -bottom-6 -left-6 w-28 h-28 bg-brand-sky/10 animate-shape-float pointer-events-none"
              aria-hidden="true"
              style={{
                borderRadius: '40% 60% 70% 30% / 40% 70% 30% 60%',
                animationDuration: '8s',
                animationDelay: '-2s'
              }}
            />
            <div
              className="absolute top-1/3 right-1/4 w-20 h-20 bg-brand-sage/10 rotate-45 animate-shape-float pointer-events-none"
              aria-hidden="true"
              style={{ animationDuration: '7s', animationDelay: '-4s' }}
            />

            <div className="text-center mb-10 sm:mb-12">
              <h2 className="font-heading text-4xl sm:text-5xl uppercase text-brand-yellow mb-4">
                {t('technical.title')}
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-brand-sky">
                {t('technical.subtitle')}
              </p>
            </div>

            {/* Architecture Overview */}
            <div className="mb-10">
              <h3 className="font-heading text-2xl uppercase text-brand-yellow text-center mb-8">
                {t('technical.architecture.title')}
              </h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-white/10 rounded-2xl p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Database className="h-6 w-6 text-brand-yellow" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">{t('technical.architecture.localStorage.title')}</h4>
                  <p className="text-sm text-brand-sky">{t('technical.architecture.localStorage.description')}</p>
                </div>

                <div className="bg-white/10 rounded-2xl p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Timer className="h-6 w-6 text-brand-yellow" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">{t('technical.architecture.webWorkers.title')}</h4>
                  <p className="text-sm text-brand-sky">{t('technical.architecture.webWorkers.description')}</p>
                </div>

                <div className="bg-white/10 rounded-2xl p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Shield className="h-6 w-6 text-brand-yellow" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">{t('technical.architecture.privacy.title')}</h4>
                  <p className="text-sm text-brand-sky">{t('technical.architecture.privacy.description')}</p>
                </div>
              </div>
            </div>

            {/* Technical Details Grid */}
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-brand-navy" />
                  <h3 className="font-heading text-xl uppercase text-brand-green">
                    {t('technical.details.privacy.title')}
                  </h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.privacy.localData')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.privacy.noAnalytics')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.privacy.noAccounts')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.privacy.offline')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-6 w-6 text-brand-navy" />
                  <h3 className="font-heading text-xl uppercase text-brand-green">
                    {t('technical.details.performance.title')}
                  </h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.performance.webWorkers')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.performance.notifications')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.performance.responsive')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.performance.instant')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Timer className="h-6 w-6 text-brand-navy" />
                  <h3 className="font-heading text-xl uppercase text-brand-green">
                    {t('technical.details.pomodoro.title')}
                  </h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.pomodoro.customizable')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.pomodoro.autoStart')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.pomodoro.notifications')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.pomodoro.statistics')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Server className="h-6 w-6 text-brand-navy" />
                  <h3 className="font-heading text-xl uppercase text-brand-green">
                    {t('technical.details.modern.title')}
                  </h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.modern.nextjs')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.modern.typescript')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.modern.tailwind')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green mt-1 flex-shrink-0" />
                    <span className="text-sm">{t('technical.details.modern.pwa')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Open Source Section - Light section */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-10 max-w-4xl mx-auto">
          <h2 className="font-heading text-4xl sm:text-5xl uppercase text-brand-green mb-4">
            {t('openSource.title')}
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground mb-8">
            {t('openSource.description')}
          </p>

          <a
            href="https://github.com/switch-to-eu/tools-mono"
            className="inline-flex items-center gap-2 mb-10 bg-brand-yellow text-brand-navy font-semibold rounded-full px-8 py-3 hover:opacity-90 transition-opacity"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Globe className="h-5 w-5" />
            {t('openSource.cta')}
            <ArrowRight className="h-5 w-5" />
          </a>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/10">
                <CheckCircle className="h-7 w-7 text-brand-green" />
              </div>
              <h4 className="font-heading text-lg uppercase text-brand-green mb-2">{t('openSource.benefits.transparency.title')}</h4>
              <p className="text-sm text-muted-foreground">{t('openSource.benefits.transparency.description')}</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy/10">
                <Users className="h-7 w-7 text-brand-navy" />
              </div>
              <h4 className="font-heading text-lg uppercase text-brand-green mb-2">{t('openSource.benefits.community.title')}</h4>
              <p className="text-sm text-muted-foreground">{t('openSource.benefits.community.description')}</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-sky/20">
                <Shield className="h-7 w-7 text-brand-navy" />
              </div>
              <h4 className="font-heading text-lg uppercase text-brand-green mb-2">{t('openSource.benefits.security.title')}</h4>
              <p className="text-sm text-muted-foreground">{t('openSource.benefits.security.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Switch-to.eu Platform Section - Navy dark block */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="bg-brand-navy rounded-3xl relative overflow-hidden">
          <div className="relative z-10 px-6 sm:px-10 md:px-16 py-12 sm:py-16">
            {/* Decorative shapes */}
            <div
              className="absolute -top-6 -left-6 w-28 h-28 rounded-full bg-brand-yellow/10 animate-shape-float pointer-events-none"
              aria-hidden="true"
              style={{ animationDuration: '8s', animationDelay: '-1s' }}
            />
            <div
              className="absolute -bottom-8 -right-8 w-40 h-40 bg-brand-sky/10 animate-shape-float pointer-events-none"
              aria-hidden="true"
              style={{
                borderRadius: '30% 70% 60% 40% / 50% 40% 60% 50%',
                animationDuration: '10s',
                animationDelay: '-4s'
              }}
            />
            <div
              className="absolute top-1/2 right-1/3 w-16 h-16 bg-brand-pink/10 rotate-45 animate-shape-float pointer-events-none"
              aria-hidden="true"
              style={{ animationDuration: '6s', animationDelay: '-2.5s' }}
            />

            <div className="text-center mb-10 sm:mb-12">
              <h2 className="font-heading text-4xl sm:text-5xl uppercase text-brand-yellow mb-4">
                {t('platform.title')}
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-brand-sky">
                {t('platform.description')}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto mb-10">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <Shield className="h-6 w-6 text-brand-yellow" />
                </div>
                <h4 className="font-semibold text-white mb-2">{t('platform.benefits.sovereignty.title')}</h4>
                <p className="text-sm text-brand-sky">{t('platform.benefits.sovereignty.description')}</p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <Lock className="h-6 w-6 text-brand-yellow" />
                </div>
                <h4 className="font-semibold text-white mb-2">{t('platform.benefits.privacy.title')}</h4>
                <p className="text-sm text-brand-sky">{t('platform.benefits.privacy.description')}</p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <Zap className="h-6 w-6 text-brand-yellow" />
                </div>
                <h4 className="font-semibold text-white mb-2">{t('platform.benefits.innovation.title')}</h4>
                <p className="text-sm text-brand-sky">{t('platform.benefits.innovation.description')}</p>
              </div>
            </div>

            <div className="text-center">
              <a
                href="https://switch-to.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-brand-yellow text-brand-navy font-semibold rounded-full px-8 py-3 hover:opacity-90 transition-opacity"
              >
                {t('platform.cta')}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
