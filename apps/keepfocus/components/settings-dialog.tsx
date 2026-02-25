"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, RotateCcw } from 'lucide-react';
import { Button } from '@switch-to-eu/ui/components/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@switch-to-eu/ui/components/dialog';
import { Label } from '@switch-to-eu/ui/components/label';
import { Input } from '@switch-to-eu/ui/components/input';
import { Switch } from '@switch-to-eu/ui/components/switch';
import { Separator } from '@switch-to-eu/ui/components/separator';
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
          <Button
            variant="outline"
            size="default"
            className="w-full bg-white border-gray-300 hover:bg-gray-50 justify-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            {t('pomodoro.settings.openSettings')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('pomodoro.settings.title')}</DialogTitle>
          <DialogDescription>
            {t('pomodoro.settings.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          {/* Left Column - Timer Durations */}
          <div className="space-y-6">
            <div className="space-y-5">
              <h3 className="font-semibold text-base text-gray-900 border-b pb-2">{t('pomodoro.settings.timerDurations')}</h3>

              <div className="space-y-3">
                <Label htmlFor="work-duration" className="text-sm font-medium">{t('pomodoro.settings.workSession')} ({t('pomodoro.settings.units.minutes')})</Label>
                <Input
                  id="work-duration"
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.workDuration}
                  onChange={(e) => updateLocalSetting('workDuration', parseInt(e.target.value) || 25)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('pomodoro.settings.workSessionHint')}
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="short-break" className="text-sm font-medium">{t('pomodoro.settings.shortBreak')} ({t('pomodoro.settings.units.minutes')})</Label>
                <Input
                  id="short-break"
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.shortBreakDuration}
                  onChange={(e) => updateLocalSetting('shortBreakDuration', parseInt(e.target.value) || 5)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('pomodoro.settings.shortBreakHint')}
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="long-break" className="text-sm font-medium">{t('pomodoro.settings.longBreak')} ({t('pomodoro.settings.units.minutes')})</Label>
                <Input
                  id="long-break"
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.longBreakDuration}
                  onChange={(e) => updateLocalSetting('longBreakDuration', parseInt(e.target.value) || 15)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('pomodoro.settings.longBreakHint')}
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="long-break-interval" className="text-sm font-medium">{t('pomodoro.settings.longBreakInterval')} ({t('pomodoro.settings.units.sessions')})</Label>
                <Input
                  id="long-break-interval"
                  type="number"
                  min="2"
                  max="10"
                  value={localSettings.longBreakInterval}
                  onChange={(e) => updateLocalSetting('longBreakInterval', parseInt(e.target.value) || 4)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('pomodoro.settings.longBreakIntervalHint')}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Auto-start & Notifications */}
          <div className="space-y-6">
            {/* Auto-start Settings */}
            <div className="space-y-5">
              <h3 className="font-semibold text-base text-gray-900 border-b pb-2">{t('pomodoro.settings.autoStart')}</h3>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="auto-start-breaks" className="text-sm font-medium">{t('pomodoro.settings.autoStartBreaks')}</Label>
                  <p className="text-xs text-gray-500 mt-1">
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
                  <Label htmlFor="auto-start-work" className="text-sm font-medium">{t('pomodoro.settings.autoStartWork')}</Label>
                  <p className="text-xs text-gray-500 mt-1">
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

            <Separator className="my-6" />

            {/* Notification Settings */}
            <div className="space-y-5">
              <h3 className="font-semibold text-base text-gray-900 border-b pb-2">{t('pomodoro.settings.notifications')}</h3>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="sound-enabled" className="text-sm font-medium">{t('pomodoro.settings.soundNotifications')}</Label>
                  <p className="text-xs text-gray-500 mt-1">
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
                  <Label htmlFor="desktop-notifications" className="text-sm font-medium">{t('pomodoro.settings.desktopNotifications')}</Label>
                  <p className="text-xs text-gray-500 mt-1">
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
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            {t('pomodoro.settings.actions.reset')}
          </Button>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleCancel} className="flex-1 sm:flex-none">
              {t('pomodoro.settings.actions.cancel')}
            </Button>
            <Button onClick={handleSave} className="flex-1 sm:flex-none">
              {t('pomodoro.settings.actions.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}