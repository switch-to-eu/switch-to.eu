"use client";

import { useTranslations } from 'next-intl';
import { PomodoroTimer } from '../../components/pomodoro-timer';
import { TodoList } from '../../components/todo-list';
import { PomodoroSettingsProvider } from '../../hooks/use-pomodoro-settings';
import { TasksProvider } from '../../hooks/use-tasks';

export default function HomePage() {
  const t = useTranslations();

  return (
    <TasksProvider>
      <PomodoroSettingsProvider>
        <main className="container mx-auto min-h-screen flex flex-col">

          {/* Hero Section */}
          <div className="text-center py-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {t('homepage.heroTitle').split('.').map((part, index, array) => (
                <span key={index}>
                  {index === array.length - 1 ? (
                    <span className="text-primary-color">{part}.</span>
                  ) : (
                    `${part}. `
                  )}
                </span>
              ))}
            </h1>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              {t('homepage.technique')}
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('homepage.heroDescription')}
            </p>
          </div>

          {/* Main Content */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 pb-16">

            {/* Timer Section */}
            <div className="flex flex-col">
              <PomodoroTimer />
            </div>

            {/* Todo List Section */}
            <div className="flex flex-col">
              <TodoList />
            </div>
          </div>
        </main>
      </PomodoroSettingsProvider>
    </TasksProvider>
  );
}