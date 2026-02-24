"use client";

import { useState, useEffect } from "react";
import { User, Edit } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import { Label } from "@switch-to-eu/ui/components/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@switch-to-eu/ui/components/dialog";

import type { DecryptedPoll } from "@/lib/interfaces";
import { LoadingButton } from "@switch-to-eu/ui/components/loading-button";
import { generateTimeSlotsFromStartTimes, formatTimeSlotRange } from "@/lib/time-utils";

type AvailabilityStatus = 'available' | 'unavailable' | 'unknown';

interface AvailabilityGridProps {
  poll: DecryptedPoll;
  currentParticipantId: string | null;
  isSaving: boolean;
  onSave?: (name: string, availability: Record<string, boolean | string[]>) => void;
}

export function AvailabilityGrid({
  poll,
  currentParticipantId,
  onSave,
  isSaving,
}: AvailabilityGridProps) {
  const t = useTranslations('AvailabilityGrid');

  // Local state to track user's changes before submitting
  const [currentUserSelections, setCurrentUserSelections] = useState<Record<string, boolean | string[]>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("");
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const currentParticipant = poll.participants.find(
      (participant) => participant.id === currentParticipantId,
    );

    if (currentParticipant) {
      setCurrentUserSelections(currentParticipant.availability);
      setCurrentUserName(currentParticipant.name);
    }
  }, [currentParticipantId, poll.participants]);

  // Transform poll data to match our component structure
  const transformedData = {
    participants: poll
      .participants.filter((participant) => participant.id !== currentParticipantId)
      .map((participant) => ({
        id: participant.id,
        name: participant.name,
        isCurrentUser: false,
      })),
    // Generate slots from duration + start times if time selection is enabled
    timeSlots: poll.allowHourSelection && poll.selectedStartTimes && poll.fixedDuration
      ? poll.dates.flatMap(date =>
          poll.selectedStartTimes!.map(startTime => ({
            id: `${date}T${startTime}`,
            date: date,
            startTime: startTime,
            duration: poll.fixedDuration!,
            displayName: `${formatDate(date)} ${formatTimeSlotRange(startTime, poll.fixedDuration!)}`
          }))
        )
      : poll.dates.map((date) => ({
          id: date,
          date: date,
          displayName: formatDate(date)
        })),
    availabilityData: poll.participants.flatMap((participant) =>
      poll.allowHourSelection && poll.selectedStartTimes && poll.fixedDuration
        ? poll.dates.flatMap(date =>
            poll.selectedStartTimes!.map(startTime => ({
              participantId: participant.id,
              timeSlotId: `${date}T${startTime}`,
              status: participant.availability[`${date}T${startTime}`] ? 'available' as const : 'unavailable' as const,
            }))
          )
        : poll.dates.map((date) => ({
            participantId: participant.id,
            timeSlotId: date,
            status: participant.availability[date] ? 'available' as const : 'unavailable' as const,
          }))
    ),
    eventOptionsCount: poll.allowHourSelection && poll.selectedStartTimes && poll.fixedDuration
      ? poll.dates.length * poll.selectedStartTimes.length
      : poll.dates.length,
  };

  // Helper function to format date consistently
  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Calculate availability counts for each time slot to find the most popular ones
  const availabilityCounts = transformedData.timeSlots.map(slot => ({
    slotId: slot.id,
    count: transformedData.availabilityData.filter(
      item => item.timeSlotId === slot.id && item.status === 'available'
    ).length
  }));

  const maxAvailabilityCount = Math.max(...availabilityCounts.map(item => item.count));
  const mostPopularSlots = new Set(
    availabilityCounts
      .filter(item => item.count === maxAvailabilityCount && item.count > 0)
      .map(item => item.slotId)
  );

  const handleCurrentUserSlotToggle = (dateId: string) => {
    const newAvailability = {
      ...currentUserSelections,
      [dateId]: !currentUserSelections[dateId]
    };

    setCurrentUserSelections(newAvailability);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (!currentUserName?.trim()) {
      setNameInput("");
      setShowNameDialog(true);
      return;
    }

    onSave?.(currentUserName, currentUserSelections);
    setCurrentUserName(currentUserName);
    setHasUnsavedChanges(false);
  };

  const handleNameSubmit = () => {
    const trimmedName = nameInput.trim();

    if (trimmedName) {
      // Check if name already exists (only if it's different from current name)
      const existingParticipant = poll.participants.find(
        p => p.name.toLowerCase() === trimmedName.toLowerCase() && p.name !== currentUserName
      );

      if (existingParticipant) {
        // TODO: Show error message about name conflict
        return;
      }

      // Save both name and current availability selections
      onSave?.(trimmedName, currentUserSelections);
      setCurrentUserName(trimmedName);
      setHasUnsavedChanges(false);
      setShowNameDialog(false);
      setNameInput("");
    }
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSubmit();
    }
  };

  const handleClear = () => {
    const clearedAvailability: Record<string, boolean | string[]> = {};
    
    // Clear all time slots (either dates or date+time combinations)
    transformedData.timeSlots.forEach((slot) => {
      clearedAvailability[slot.id] = false;
    });
    
    setCurrentUserSelections(clearedAvailability);
    setHasUnsavedChanges(true);
    onSave?.(currentUserName, clearedAvailability);
  };

  // Helper function to get avatar color
  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-pink-500 text-white',
      'bg-purple-500 text-white',
      'bg-green-500 text-white',
      'bg-yellow-500 text-black',
      'bg-red-500 text-white',
    ];
    return colors[index % colors.length];
  };

  // Helper function to render availability icon
  const renderAvailabilityIcon = (status: AvailabilityStatus, isCurrentUser: boolean, onClick?: () => void) => {
    if (isCurrentUser) {
      return (
        <button
          onClick={onClick}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 hover:border-gray-400 hover:shadow-sm transition-all duration-150 bg-white"
        >
          {status === 'available' && (
            <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {status === 'unavailable' && (
            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
          {status === 'unknown' && (
            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      );
    }

    // For other participants
    return (
      <div className="flex h-8 w-8 items-center justify-center">
        {status === 'available' && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-sm">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {status === 'unavailable' && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 shadow-sm">
            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {status === 'unknown' && (
          <div className="h-6 w-6 rounded-full border-2 border-gray-300 bg-white"></div>
        )}
      </div>
    );
  };

  const isEditingName = currentUserName && showNameDialog;

  return (
    <div className="mx-auto max-w-7xl border border-primary-color bg-white shadow-sm overflow-hidden sm:rounded-lg">
      {/* Header */}
      <div className="flex items-center border-primary-color gradient-bg-purple-blue justify-between border-b px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {t('participants')} <span className="text-gray-500">{transformedData.participants.length + 1}</span>
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {transformedData.eventOptionsCount} {t('options')}
          </span>
        </div>
      </div>

      {/* Table Layout */}
      <div className="flex">
        {/* Sticky Participant Names Column */}
        <div className="w-30 sm:w-56 flex-shrink-0 border-r border-primary-color bg-white">
          {/* Header for names column */}
          <div className="border-b border-primary-color   bg-gray-50 px-4 py-4 h-[120px] flex items-end">
            <div className="text-sm font-medium text-gray-600">{t('participants')}</div>
          </div>

          {/* Current User Row */}
          <div className="px-4 py-4 h-[72px] flex items-center border-b border-primary-color bg-blue-50">
            <div className="flex items-center gap-3 w-full">
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-gray-500 text-white">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 flex items-center gap-2">
                <span className="truncate text-sm font-medium text-gray-900">
                  {currentUserName || t('you')}
                </span>
                {currentUserName && (
                  <span className="hidden sm:inline text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {t('you_label')}
                  </span>
                )}
                {currentUserName && (
                  <button
                    onClick={() => {
                      setNameInput(currentUserName);
                      setShowNameDialog(true);
                    }}
                    className="text-primary-color hover:text-blue-800 ml-1 p-1 hover:bg-blue-100 rounded transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Other Participant names */}
          {transformedData.participants.map((participant, index) => {
            const isLastRow = index === transformedData.participants.length - 1;
            return (
              <div key={participant.id} className={`px-4 py-4 h-[72px] flex items-center ${isLastRow ? '' : 'border-b border-primary-color'} hover:bg-gray-50`}>
                <div className="flex items-center gap-3 w-full">
                  <div className={`hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${getAvatarColor(index)}`}>
                    <span className="text-sm font-bold uppercase">{participant.name.charAt(0)}</span>
                  </div>
                  <span className="flex-1 truncate text-sm font-medium text-gray-900">
                    {participant.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-max">
            {/* Date/Time Headers */}
            <div className="flex border-b border-primary-color bg-gray-50 h-[120px]">
              {transformedData.timeSlots.map((slot) => {
                const availableCount = transformedData.availabilityData.filter(
                  item => item.timeSlotId === slot.id && item.status === 'available'
                ).length;

                const isMostPopular = mostPopularSlots.has(slot.id);
                const isTimedPoll = poll.allowHourSelection && poll.selectedStartTimes && poll.fixedDuration;

                return (
                  <div key={slot.id} className={`w-24 sm:w-28 flex-shrink-0 border-r border-primary-color px-2 py-4 text-center flex flex-col justify-end ${isMostPopular ? 'bg-green-50 border-green-200' : ''
                    }`}>
                    {isTimedPoll && 'startTime' in slot && 'duration' in slot ? (
                      // Time range display for timed polls
                      <>
                        <div className="text-xs text-gray-600 mb-1">
                          {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`text-xs font-semibold mb-1 ${isMostPopular ? 'text-green-800' : 'text-gray-900'
                          }`}>
                          {new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-700 mb-2 font-medium">
                          {formatTimeSlotRange(slot.startTime as string, slot.duration as number)}
                        </div>
                      </>
                    ) : (
                      // All-day display for date-only polls
                      <>
                        <div className="text-xs text-gray-600 mb-1">
                          {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`text-sm font-semibold mb-1 ${isMostPopular ? 'text-green-800' : 'text-gray-900'
                          }`}>
                          {new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">{t('allDay')}</div>
                      </>
                    )}
                    <div className="flex items-center justify-center gap-1 text-xs">
                      {isMostPopular && (
                        <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                      <svg className="h-3 w-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className={`font-medium ${isMostPopular ? 'text-green-700' : 'text-gray-500'
                        }`}>{availableCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current User Availability Row */}
            <div className="flex h-[72px] border-b border-primary-color bg-blue-50 hover:bg-blue-100">
              {transformedData.timeSlots.map((slot) => {
                const isAvailable = currentUserSelections[slot.id] ?? false;
                const status: AvailabilityStatus = isAvailable ? 'available' : 'unavailable';
                const isMostPopular = mostPopularSlots.has(slot.id);

                return (
                  <div
                    key={slot.id}
                    className={`flex w-24 sm:w-28 flex-shrink-0 items-center justify-center border-r border-gray-200 ${isMostPopular ? 'bg-green-50' : ''
                      }`}
                  >
                    {renderAvailabilityIcon(status, true, () => {
                      handleCurrentUserSlotToggle(slot.id);
                    })}
                  </div>
                );
              })}
            </div>

            {/* Other Participants Availability Rows */}
            {transformedData.participants.map((participant, index) => {
              const isLastRow = index === transformedData.participants.length - 1;
              return (
                <div key={participant.id} className={`flex h-[72px] ${isLastRow ? '' : 'border-b border-primary-color'} hover:bg-gray-50`}>
                  {transformedData.timeSlots.map((slot) => {
                    const availability = transformedData.availabilityData.find(
                      item => item.participantId === participant.id && item.timeSlotId === slot.id
                    );
                    const status = availability?.status ?? 'unknown';
                    const isMostPopular = mostPopularSlots.has(slot.id);

                    return (
                      <div
                        key={slot.id}
                        className={`flex w-24 sm:w-28 flex-shrink-0 items-center justify-center border-r border-gray-200 ${isMostPopular ? 'bg-green-50' : ''
                          }`}
                      >
                        {renderAvailabilityIcon(status, false)}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer - Always show */}
      <div className="flex items-center justify-between border-t border-primary-color px-6 py-4">
        <Button
          variant="secondary"
          onClick={handleClear}
          className="bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-700"
        >
          {t('clearAll')}
        </Button>
        <div className="flex items-center gap-4">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-yellow-800 font-medium">{t('unsavedChanges')}</span>
            </div>
          )}
          <LoadingButton
            onClick={handleSave}
            loading={isSaving}
            className="bg-blue-600 hover:bg-blue-700 px-8"
          >
            {t('save')}
          </LoadingButton>
        </div>
      </div>

      {/* Name Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>{isEditingName ? t('nameDialog.titleEdit') : t('nameDialog.titleNew')}</DialogTitle>
            <DialogDescription>
              {isEditingName
                ? t('nameDialog.descriptionEdit')
                : t('nameDialog.descriptionNew')
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('nameDialog.nameLabel')}
              </Label>
              <Input
                id="name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyPress={handleNameKeyPress}
                className="col-span-3"
                placeholder={t('nameDialog.placeholder')}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowNameDialog(false)}
            >
              {t('nameDialog.cancel')}
            </Button>

            <LoadingButton
              type="submit"
              loading={isSaving}
              onClick={handleNameSubmit}
              disabled={!nameInput.trim()}
            >
              {isEditingName ? t('nameDialog.update') : t('nameDialog.save')}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}