"use client";

import { useTranslations } from 'next-intl';
import { Timer, Coffee, Repeat } from 'lucide-react';
import { PomodoroTimer } from '../../components/pomodoro-timer';
import { TodoList } from '../../components/todo-list';
import { PomodoroSettingsProvider } from '../../hooks/use-pomodoro-settings';
import { TasksProvider } from '../../hooks/use-tasks';

export default function HomePage() {
  const t = useTranslations();

  return (
    <TasksProvider>
      <PomodoroSettingsProvider>
        <main className="container max-w-7xl mx-auto min-h-screen flex flex-col px-3 sm:px-4 md:px-6 lg:px-8">

          {/* Hero Section - Navy dark block */}
          <div className="py-8 sm:py-12">
            <div className="bg-brand-navy rounded-3xl relative overflow-hidden">
              <div className="relative z-10 px-6 sm:px-10 md:px-16 py-12 sm:py-16 text-center">

                {/* Decorative shapes */}
                <div
                  className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-brand-sky/15 animate-shape-float pointer-events-none"
                  aria-hidden="true"
                  style={{ animationDuration: '8s' }}
                />
                <div
                  className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-yellow/10 animate-shape-float pointer-events-none"
                  aria-hidden="true"
                  style={{
                    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                    animationDuration: '9s',
                    animationDelay: '-3s'
                  }}
                />

                {/* Decorative X / cross shape */}
                <div
                  className="absolute top-8 left-8 w-20 h-20 animate-shape-float pointer-events-none opacity-[0.12]"
                  aria-hidden="true"
                  style={{ animationDuration: '10s', animationDelay: '-2s' }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-3 bg-brand-pink rounded-full absolute" />
                    <div className="w-full h-3 bg-brand-pink rounded-full absolute rotate-90" />
                  </div>
                </div>

                {/* Hero heading */}
                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow mb-4 leading-tight">
                  {t('homepage.heroTitle')}
                </h1>

                {/* Description */}
                <p className="text-brand-sky text-lg max-w-2xl mx-auto">
                  {t('homepage.heroDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content - Timer + Todo side by side */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

            {/* Timer Section */}
            <div className="flex flex-col">
              <PomodoroTimer />
            </div>

            {/* Todo List Section */}
            <div className="flex flex-col">
              <TodoList />
            </div>
          </div>

          {/* How Pomodoro Works Section - compact Navy bar */}
          <div className="py-6 sm:py-8 pb-10 sm:pb-14">
            <div className="bg-brand-navy rounded-3xl relative overflow-hidden">
              <div className="relative z-10 px-6 sm:px-8 md:px-12 py-6 sm:py-8">

                {/* Decorative shape */}
                <div
                  className="absolute -top-3 -right-3 w-14 h-14 rounded-full bg-brand-sky/10 animate-shape-float pointer-events-none"
                  aria-hidden="true"
                  style={{ animationDuration: '7s' }}
                />

                {/* Section heading */}
                <h2 className="font-heading text-2xl sm:text-3xl uppercase text-brand-yellow mb-6 text-center">
                  {t('homepage.howItWorks.title')}
                </h2>

                {/* 3-step row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  {/* Step 1: Focus */}
                  <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0">
                    <div className="flex-shrink-0 sm:mx-auto sm:mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-yellow/20">
                      <Timer className="h-5 w-5 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base uppercase text-brand-yellow sm:mb-1">
                        {t('homepage.howItWorks.focus.title')}
                      </h3>
                      <p className="text-brand-sky/80 text-xs">
                        {t('homepage.howItWorks.focus.description')}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Break */}
                  <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0">
                    <div className="flex-shrink-0 sm:mx-auto sm:mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-yellow/20">
                      <Coffee className="h-5 w-5 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base uppercase text-brand-yellow sm:mb-1">
                        {t('homepage.howItWorks.break.title')}
                      </h3>
                      <p className="text-brand-sky/80 text-xs">
                        {t('homepage.howItWorks.break.description')}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Repeat */}
                  <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0">
                    <div className="flex-shrink-0 sm:mx-auto sm:mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-yellow/20">
                      <Repeat className="h-5 w-5 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base uppercase text-brand-yellow sm:mb-1">
                        {t('homepage.howItWorks.repeat.title')}
                      </h3>
                      <p className="text-brand-sky/80 text-xs">
                        {t('homepage.howItWorks.repeat.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </main>
      </PomodoroSettingsProvider>
    </TasksProvider>
  );
}
