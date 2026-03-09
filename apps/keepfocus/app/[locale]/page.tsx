"use client";

import { useTranslations } from 'next-intl';
import { Timer, Coffee, Repeat } from 'lucide-react';
import { PomodoroTimer } from '../../components/pomodoro-timer';
import { TodoList } from '../../components/todo-list';
import { PomodoroSettingsProvider } from '../../hooks/use-pomodoro-settings';
import { TasksProvider } from '../../hooks/use-tasks';
import { Banner } from '@switch-to-eu/blocks/components/banner';
import { PageLayout } from '@switch-to-eu/blocks/components/page-layout';
import { Container } from '@switch-to-eu/blocks/components/container';

export default function HomePage() {
  const t = useTranslations();

  return (
    <TasksProvider>
      <PomodoroSettingsProvider>
        <PageLayout className="min-h-screen" gapMobile>

          {/* Hero Section */}
          <Container noPaddingMobile>
            <Banner
              color="bg-brand-navy"
              shapes={[
                { shape: "circle", className: "-top-6 -right-6 w-24 h-24", opacity: 0.15 },
                { shape: "blob", className: "-bottom-8 -left-8 w-32 h-32", opacity: 0.1, delay: "-3s" },
                { shape: "cross", className: "top-8 left-8 w-20 h-20", opacity: 0.12, duration: "10s", delay: "-2s" },
              ]}
              contentClassName="text-center"
            >
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow mb-4 leading-tight">
                {t('homepage.heroTitle')}
              </h1>
              <p className="text-brand-sky text-lg max-w-2xl mx-auto">
                {t('homepage.heroDescription')}
              </p>
            </Banner>
          </Container>

          {/* Main Content - Timer + Todo side by side */}
          <Container>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="flex flex-col">
                <PomodoroTimer />
              </div>
              <div className="flex flex-col">
                <TodoList />
              </div>
            </div>
          </Container>

          {/* How Pomodoro Works Section */}
          <Container noPaddingMobile>
            <Banner
              color="bg-brand-navy"
              shapes={[
                { shape: "spark", className: "-top-3 -right-3 w-20 h-20", opacity: 0.1 },
              ]}
              contentClassName="text-center"
            >
              <h2 className="font-heading text-2xl sm:text-3xl uppercase text-brand-yellow mb-6">
                {t('homepage.howItWorks.title')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {([
                  { icon: Timer, key: 'focus' },
                  { icon: Coffee, key: 'break' },
                  { icon: Repeat, key: 'repeat' },
                ] as const).map(({ icon: Icon, key }) => (
                  <div key={key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0">
                    <div className="flex-shrink-0 sm:mx-auto sm:mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-yellow/20">
                      <Icon className="h-5 w-5 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base uppercase text-brand-yellow sm:mb-1">
                        {t(`homepage.howItWorks.${key}.title`)}
                      </h3>
                      <p className="text-brand-sky/80 text-xs">
                        {t(`homepage.howItWorks.${key}.description`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Banner>
          </Container>

        </PageLayout>
      </PomodoroSettingsProvider>
    </TasksProvider>
  );
}
