"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, Calendar, FileText, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@switch-to-eu/ui/components/button";
import { Calendar as CalendarComponent } from "@switch-to-eu/blocks/components/calendar";
import { SectionCard, SectionHeader, SectionContent } from "@switch-to-eu/blocks/components/section-card";
import { LoadingButton } from "@components/ui/loading-button";
import { FormInput } from "@components/ui/form-input";
import { FormTextArea } from "@components/ui/form-textarea";
import { TimeSelectionToggle } from "@components/ui/time-selection-toggle";
import { DurationSelector } from "@components/ui/duration-selector";
import { TimeSlotsManager } from "@components/ui/time-slots-manager";
import { pollSchema, type PollFormData } from "@/lib/schemas";

// Type for processed form data that gets sent to the onSubmit handler
export type ProcessedPollFormData = Omit<PollFormData, 'selectedStartTimes'> & {
  selectedStartTimes?: string[]; // Converted to string format
};

interface PollFormProps {
  onSubmit: (data: ProcessedPollFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitText?: string;
  initialData?: Partial<PollFormData>;
  hideMobileSubmit?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export function PollForm({
  onSubmit,
  onCancel,
  isLoading = false,
  submitText,
  initialData,
  hideMobileSubmit = false,
  formRef
}: PollFormProps) {
  const t = useTranslations('PollForm');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PollFormData>({
    resolver: zodResolver(pollSchema) as any,
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      location: initialData?.location ?? "",
      selectedDates: initialData?.selectedDates ?? [],
      expirationDays: initialData?.expirationDays ?? 30,
      enableTimeSelection: initialData?.enableTimeSelection ?? false,
      fixedDuration: initialData?.fixedDuration ?? 1,
      selectedStartTimes: initialData?.selectedStartTimes ?? [],
    },
  });

  const selectedDates = watch("selectedDates");
  const enableTimeSelection = watch("enableTimeSelection");
  const fixedDuration = watch("fixedDuration");
  const selectedStartTimes = watch("selectedStartTimes");

  const handleFormSubmit = async (data: PollFormData) => {
    // Convert start times from {hour, minutes} objects to "HH:MM" strings for backend
    const processedData: ProcessedPollFormData = {
      ...data,
      selectedStartTimes: data.selectedStartTimes?.map(startTime => {
        const hour = startTime.hour.toString().padStart(2, '0');
        const minutes = startTime.minutes.toString().padStart(2, '0');
        return `${hour}:${minutes}`;
      }) || [],
    };
    
    await onSubmit(processedData);
  };

  // Use provided submitText or fall back to translation
  const buttonText = submitText || t('buttons.createPoll');
  const loadingText = onCancel ? t('buttons.savingText') : t('buttons.creatingText');

  return (
    <form ref={formRef} onSubmit={handleSubmit(handleFormSubmit)} className="">
      {/* Event Section - Separate Box */}
      <SectionCard className="mb-6">
        <SectionHeader
          icon={<FileText className="h-5 w-5" />}
          title={t('sections.event.title')}
          description={t('sections.event.description')}
        />
        <SectionContent>
          <div className="space-y-5">
            <FormInput<PollFormData>
              label={t('fields.title.label')}
              name="title"
              placeholder={t('fields.title.placeholder')}
              register={register}
              error={errors.title}
              schema={pollSchema}
            />

            <FormInput<PollFormData>
              label={t('fields.location.label')}
              name="location"
              placeholder={t('fields.location.placeholder')}
              register={register}
              error={errors.location}
              schema={pollSchema}
            />

            <FormTextArea<PollFormData>
              label={t('fields.description.label')}
              name="description"
              placeholder={t('fields.description.placeholder')}
              register={register}
              error={errors.description}
              rows={4}
              schema={pollSchema}
            />

          </div>
        </SectionContent>
      </SectionCard>

      {/* Calendar Section - Separate Box */}
      <SectionCard className="mb-6">
        <SectionHeader
          icon={<Calendar className="h-5 w-5" />}
          title={t('sections.calendar.title')}
          description={t('sections.calendar.description')}
        />
        <SectionContent>
          {errors.selectedDates && (
            <p className="mb-4 text-sm text-red-500">
              {errors.selectedDates.message}
            </p>
          )}

          {/* Two-column layout: Calendar + Selected Dates */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column: Calendar - Fixed width */}
            <div className="space-y-4 lg:col-span-1">
              <div className="w-fit">
                <Controller
                  name="selectedDates"
                  control={control}
                  render={({ field }) => (
                    <CalendarComponent
                      mode="multiple"
                      selected={field.value}
                      onSelect={(dates) => field.onChange(dates ?? [])}
                      className="rounded-md border-primary"
                    />
                  )}
                />
              </div>

              {/* Today Button */}
              <div className="flex justify-start">
                <Controller
                  name="selectedDates"
                  control={control}
                  render={({ field }) => (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        const today = new Date();
                        if (
                          !field.value.some(
                            (date) =>
                              date.toDateString() === today.toDateString(),
                          )
                        ) {
                          field.onChange([...field.value, today]);
                        }
                      }}
                      className="px-6 text-sm shadow-card hover:shadow-card-hover transition-all"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {t('calendar.todayButton')}
                    </Button>
                  )}
                />
              </div>
            </div>

            {/* Right Column: Selected Dates - Scalable */}
            <div className="space-y-4 lg:col-span-2">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">{t('calendar.selectedDates')}</h3>

                {selectedDates && selectedDates.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {selectedDates
                      .sort((a, b) => a.getTime() - b.getTime())
                      .map((date, index) => (
                        <Controller
                          key={index}
                          name="selectedDates"
                          control={control}
                          render={({ field }) => (
                            <div
                              className="group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-primary p-3 shadow-card hover:shadow-card-hover bg-white transition-all hover:scale-105"
                              onClick={() => {
                                field.onChange(
                                  field.value.filter((_, i) => i !== index),
                                );
                              }}
                            >
                              <div className="text-center text-xs font-medium tracking-wide uppercase text-primary-color group-hover:text-purple-700">
                                {date
                                  .toLocaleDateString("en-US", {
                                    month: "short",
                                  })
                                  .toUpperCase()}
                              </div>
                              <div className="text-xl leading-none font-bold text-purple-800 group-hover:text-purple-900">
                                {date.getDate()}
                              </div>
                              <div className="text-xs font-medium text-primary-color group-hover:text-purple-700">
                                {date
                                  .toLocaleDateString("en-US", {
                                    weekday: "short",
                                  })
                                  .toUpperCase()}
                              </div>
                            </div>
                          )}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 rounded-lg bg-purple-50 border-2 border-dashed border-purple-300">
                    <Calendar className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-primary-color font-medium">
                      {t('calendar.noDatesSelected')}
                    </p>
                    <p className="text-xs text-purple-500 mt-1">
                      {t('calendar.chooseDates')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionContent>
      </SectionCard>

      {/* Time Section - Always present */}
      <SectionCard className="mb-6">
        <SectionHeader
          icon={<Clock className="h-5 w-5" />}
          title="Time"
          description="Configure timing for your event"
        />
        <SectionContent>
          <div className="space-y-6">
            {/* All Day / Time Slots Toggle */}
            <TimeSelectionToggle<PollFormData>
              name="enableTimeSelection"
              control={control}
              error={errors.enableTimeSelection}
              description={t('sections.timing.toggleDescription')}
            />

            {/* Time Slots Manager - Only shown when time selection is enabled */}
            {enableTimeSelection && (
              <TimeSlotsManager<PollFormData>
                name="selectedStartTimes"
                setValue={setValue}
                watch={watch}
                error={errors.selectedStartTimes as any}
                label={t('sections.timeSlots.title')}
                description={t('sections.timeSlots.startTimesDescription')}
                selectedTimesFieldName="selectedStartTimes"
                durationFieldName="fixedDuration"
              />
            )}
          </div>
        </SectionContent>
      </SectionCard>

      {/* Action Buttons */}
      <div className={`pt-4 sm:pt-6 ${hideMobileSubmit ? "hidden sm:block" : ""}`}>
        {onCancel ? (
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              {t('buttons.cancel')}
            </Button>

            <LoadingButton
              type="submit"
              loading={isLoading}
              loadingText={loadingText}
              className="flex-1"
            >
              <Users className="mr-2 h-5 w-5" />
              {buttonText}
            </LoadingButton>
          </div>
        ) : (
          <LoadingButton
            type="submit"
            loading={isLoading}
            loadingText={loadingText}
            className="w-full"
          >
            <Users className="mr-2 h-5 w-5" />
            {buttonText}
          </LoadingButton>
        )}
      </div>
    </form>
  );
}