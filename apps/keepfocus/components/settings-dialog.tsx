"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@switch-to-eu/ui/components/dialog';
import { Label } from '@switch-to-eu/ui/components/label';
import { Input } from '@switch-to-eu/ui/components/input';
import { Switch } from '@switch-to-eu/ui/components/switch';
import { usePomodoroSettings } from '../hooks/use-pomodoro-settings';
import { PomodoroSettings, DEFAULT_SETTINGS } from '../lib/types';

interface SettingsDialogProps {
  trigger?: React.ReactNode;
}

export function SettingsDialog({ trigger }: SettingsDialogProps = {}) {
  const t = useTranslations();
  const { settings, updateSettings } = usePomodoroSettings();
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(settings);
  const [isOpen, setIsOpen] = useState(false);

  // Sync local settings when dialog opens or settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  const handleSave = () => {
    updateSettings(localSettings);
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    updateSettings(DEFAULT_SETTINGS);
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setIsOpen(false);
  };

  const updateLocalSetting = <K extends keyof PomodoroSettings>(
    key: K,
    value: PomodoroSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="w-full flex items-center justify-center gap-2 rounded-full border border-white/20 text-white/60 hover:text-white/90 hover:border-white/40 px-6 py-2.5 text-sm transition-colors">
            <Settings className="w-4 h-4" />
            {t('pomodoro.settings.openSettings')}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white border-0">
        <DialogHeader className="pb-2">
          <DialogTitle className="font-heading text-2xl uppercase text-brand-navy">
            {t('pomodoro.settings.title')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('pomodoro.settings.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          {/* Left Column - Timer Durations */}
          <div className="space-y-6">
            <div className="space-y-5">
              <h3 className="font-heading text-sm uppercase tracking-wider text-brand-navy border-b border-border/50 pb-2">
                {t('pomodoro.settings.timerDurations')}
              </h3>

              <div className="space-y-2">
                <Label htmlFor="work-duration" className="text-sm font-medium">
                  {t('pomodoro.settings.workSession')} ({t('pomodoro.settings.units.minutes')})
                </Label>
                <Input
                  id="work-duration"
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.workDuration}
                  onChange={(e) => updateLocalSetting('workDuration', parseInt(e.target.value) || 25)}
                  className="w-full rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  {t('pomodoro.settings.workSessionHint')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short-break" className="text-sm font-medium">
                  {t('pomodoro.settings.shortBreak')} ({t('pomodoro.settings.units.minutes')})
                </Label>
                <Input
                  id="short-break"
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.shortBreakDuration}
                  onChange={(e) => updateLocalSetting('shortBreakDuration', parseInt(e.target.value) || 5)}
                  className="w-full rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  {t('pomodoro.settings.shortBreakHint')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="long-break" className="text-sm font-medium">
                  {t('pomodoro.settings.longBreak')} ({t('pomodoro.settings.units.minutes')})
                </Label>
                <Input
                  id="long-break"
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.longBreakDuration}
                  onChange={(e) => updateLocalSetting('longBreakDuration', parseInt(e.target.value) || 15)}
                  className="w-full rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  {t('pomodoro.settings.longBreakHint')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="long-break-interval" className="text-sm font-medium">
                  {t('pomodoro.settings.longBreakInterval')} ({t('pomodoro.settings.units.sessions')})
                </Label>
                <Input
                  id="long-break-interval"
                  type="number"
                  min="2"
                  max="10"
                  value={localSettings.longBreakInterval}
                  onChange={(e) => updateLocalSetting('longBreakInterval', parseInt(e.target.value) || 4)}
                  className="w-full rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  {t('pomodoro.settings.longBreakIntervalHint')}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Auto-start & Notifications */}
          <div className="space-y-6">
            {/* Auto-start Settings */}
            <div className="space-y-5">
              <h3 className="font-heading text-sm uppercase tracking-wider text-brand-navy border-b border-border/50 pb-2">
                {t('pomodoro.settings.autoStart')}
              </h3>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="auto-start-breaks" className="text-sm font-medium">
                    {t('pomodoro.settings.autoStartBreaks')}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('pomodoro.settings.autoStartBreaksHint')}
                  </p>
                </div>
                <Switch
                  id="auto-start-breaks"
                  checked={localSettings.autoStartBreaks}
                  onCheckedChange={(checked) => updateLocalSetting('autoStartBreaks', checked)}
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="auto-start-work" className="text-sm font-medium">
                    {t('pomodoro.settings.autoStartWork')}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('pomodoro.settings.autoStartWorkHint')}
                  </p>
                </div>
                <Switch
                  id="auto-start-work"
                  checked={localSettings.autoStartWork}
                  onCheckedChange={(checked) => updateLocalSetting('autoStartWork', checked)}
                />
              </div>
            </div>

            <div className="border-t border-border/50" />

            {/* Notification Settings */}
            <div className="space-y-5">
              <h3 className="font-heading text-sm uppercase tracking-wider text-brand-navy border-b border-border/50 pb-2">
                {t('pomodoro.settings.notifications')}
              </h3>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="sound-enabled" className="text-sm font-medium">
                    {t('pomodoro.settings.soundNotifications')}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('pomodoro.settings.soundNotificationsHint')}
                  </p>
                </div>
                <Switch
                  id="sound-enabled"
                  checked={localSettings.soundEnabled}
                  onCheckedChange={(checked) => updateLocalSetting('soundEnabled', checked)}
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="desktop-notifications" className="text-sm font-medium">
                    {t('pomodoro.settings.desktopNotifications')}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('pomodoro.settings.desktopNotificationsHint')}
                  </p>
                </div>
                <Switch
                  id="desktop-notifications"
                  checked={localSettings.desktopNotifications}
                  onCheckedChange={(checked) => updateLocalSetting('desktopNotifications', checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-border/50">
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm text-brand-sky hover:text-brand-navy border border-border/50 hover:border-brand-navy/20 transition-colors w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            {t('pomodoro.settings.actions.reset')}
          </button>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleCancel}
              className="flex-1 sm:flex-none rounded-full px-6 py-2.5 text-sm text-brand-navy border border-brand-navy/20 hover:border-brand-navy/40 transition-colors"
            >
              {t('pomodoro.settings.actions.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none rounded-full px-8 py-2.5 text-sm font-semibold bg-brand-yellow text-brand-navy hover:opacity-90 transition-opacity"
            >
              {t('pomodoro.settings.actions.save')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
