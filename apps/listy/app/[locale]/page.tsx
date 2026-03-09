import { Link } from "@switch-to-eu/i18n/navigation";
import { Shield, CheckCircle, Lock, ListChecks } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@switch-to-eu/ui/components/card";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations('HomePage');

  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-tool-surface/10 via-tool-surface/5 to-card"></div>

        <div className="relative z-10 container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6 text-5xl font-bold sm:mb-8 sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-tool-primary to-tool-accent bg-clip-text text-transparent">
                {t('hero.title')}
              </span>
              <br />
              <span className="text-foreground">{t('hero.subtitle')}</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground sm:mb-10 sm:text-2xl">
              {t('hero.description')}
            </p>

            <div className="inline-block">
              <Link href="/create" className="inline-block">
                <Button
                  variant="default"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold shadow-xl transition-all hover:scale-105"
                >
                  <ListChecks className="mr-3 h-6 w-6" />
                  {t('hero.cta')}
                </Button>
              </Link>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('hero.disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-card py-8 sm:py-12">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-success" />
              {t('trust.badges.noAccount')}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-success" />
              {t('trust.badges.encrypted')}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-success" />
              {t('trust.badges.autoDelete')}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-success" />
              {t('trust.badges.openSource')}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
              {t('benefits.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {t('benefits.description')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <Card className="border-0 bg-gradient-to-br from-card to-tool-surface/10 shadow-lg transition-all hover:scale-105 hover:shadow-xl p-8">
              <CardHeader className="text-center p-0">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-tool-primary to-tool-accent">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-foreground mb-4">
                  {t('benefits.privacy.title')}
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  {t('benefits.privacy.description')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-card to-tool-surface/10 shadow-lg transition-all hover:scale-105 hover:shadow-xl p-8 relative overflow-hidden">
              <CardHeader className="text-center p-0 relative z-10">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-tool-primary to-tool-accent">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-foreground mb-4">
                  {t('benefits.encrypted.title')}
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  {t('benefits.encrypted.description')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden bg-gradient-to-r from-tool-primary via-tool-accent to-tool-primary py-16 sm:py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
            {t('cta.title')}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90 sm:mb-10">
            {t('cta.description')}
          </p>
          <Link href="/create" className="inline-block">
            <Button
              variant="secondary"
              size="lg"
              className="bg-card text-primary-color shadow-xl transition-all hover:scale-105 hover:bg-muted px-8 py-4 text-lg font-semibold"
            >
              <ListChecks className="mr-3 h-6 w-6" />
              {t('cta.button')}
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
