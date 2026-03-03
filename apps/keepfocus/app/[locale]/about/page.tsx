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
import { Banner } from '@switch-to-eu/blocks/components/banner';

export default function AboutPage() {
  const t = useTranslations('AboutPage');

  return (
    <div className="container max-w-7xl mx-auto flex flex-col gap-8 sm:gap-12 md:gap-16 py-8 sm:py-12 md:px-6 lg:px-8">

      {/* Hero Section */}
      <Banner
        color="bg-brand-navy"
        shapes={[
          { shape: "circle", className: "-top-6 -right-6 w-32 h-32", opacity: 0.15, duration: "8s" },
          { shape: "blob", className: "-bottom-8 -left-8 w-40 h-40", opacity: 0.1, duration: "9s", delay: "-3s" },
          { shape: "diamond-4", className: "top-1/4 -left-4 w-16 h-16", opacity: 0.1, duration: "7s", delay: "-1.5s" },
        ]}
        contentClassName="text-center max-w-4xl mx-auto"
      >
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
      </Banner>

      {/* About KeepFocus Section */}
      <div>
        <div className="text-center mb-10 sm:mb-12 px-3 md:px-0">
          <h2 className="font-heading text-4xl sm:text-5xl uppercase text-brand-green mb-4">
            {t('keepfocus.title')}
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
            {t('keepfocus.subtitle')}
          </p>
        </div>

        <div className="grid gap-0 md:gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
          <div className="bg-brand-sky md:rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
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

          <div className="bg-brand-yellow md:rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
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

          <div className="bg-brand-navy md:rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
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

      {/* Technical Deep Dive Section */}
      <Banner
        color="bg-brand-green"
        shapes={[
          { shape: "circle", className: "-top-8 -right-8 w-36 h-36", color: "text-brand-yellow", opacity: 0.1, duration: "9s" },
          { shape: "pebble", className: "-bottom-6 -left-6 w-28 h-28", color: "text-brand-sky", opacity: 0.1, duration: "8s", delay: "-2s" },
          { shape: "diamond-4", className: "top-1/3 right-1/4 w-20 h-20", color: "text-brand-sage", opacity: 0.1, duration: "7s", delay: "-4s" },
        ]}
      >
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
      </Banner>

      {/* Open Source Section */}
      <div className="text-center px-3 md:px-0 max-w-4xl mx-auto">
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

      {/* Switch-to.eu Platform Section */}
      <Banner
        color="bg-brand-navy"
        shapes={[
          { shape: "circle", className: "-top-6 -left-6 w-28 h-28", color: "text-brand-yellow", opacity: 0.1, duration: "8s", delay: "-1s" },
          { shape: "blob", className: "-bottom-8 -right-8 w-40 h-40", color: "text-brand-sky", opacity: 0.1, duration: "10s", delay: "-4s" },
          { shape: "diamond-4", className: "top-1/2 right-1/3 w-16 h-16", color: "text-brand-pink", opacity: 0.1, duration: "6s", delay: "-2.5s" },
        ]}
      >
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
      </Banner>

    </div>
  );
}
