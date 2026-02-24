"use client";

import { User, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionCard, SectionHeader, SectionContent } from "@switch-to-eu/blocks/components/section-card";
import { Skeleton } from "@switch-to-eu/ui/components/skeleton";

interface PollLoadingProps {
  showAdminActions?: boolean;
}

export function PollLoading({ showAdminActions = false }: PollLoadingProps) {
  const t = useTranslations('PollLoading');

  return (
    <div className="py-0 sm:py-12 lg:py-16">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Poll Info Skeleton */}
        <SectionCard>
          <SectionHeader
            icon={<User className="h-5 w-5" />}
            title="Loading..."
            description={t('eventDetails')}
          />
          <SectionContent className="text-center">
            <div className="space-y-4">
              <Skeleton className="h-5 w-48 mx-auto" />
              <div className="flex items-center justify-center gap-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </SectionContent>
        </SectionCard>

        {/* Admin Actions Skeleton */}
        {showAdminActions && (
          <SectionCard>
            <SectionHeader
              icon={<User className="h-5 w-5" />}
              title="Loading..."
              description="Loading poll settings"
            />
            <SectionContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 flex-1" />
                </div>
              </div>
            </SectionContent>
          </SectionCard>
        )}

        {/* Best Time Skeleton */}
        <SectionCard>
          <SectionHeader
            icon={<User className="h-5 w-5" />}
            title="Loading..."
            description="Loading best time"
          />
          <SectionContent className="text-center">
            <Skeleton className="h-7 w-56 mx-auto" />
          </SectionContent>
        </SectionCard>

        {/* Availability Section Skeleton */}
        <SectionCard>
          <SectionHeader
            icon={<User className="h-5 w-5" />}
            title={t('yourAvailability')}
            description={t('loadingAvailabilityForm')}
          />
          <SectionContent className="space-y-6">
            <Skeleton className="h-12 w-full" />
          </SectionContent>
        </SectionCard>

        {/* Results Section Skeleton */}
        <SectionCard>
          <SectionHeader
            icon={<Users className="h-5 w-5" />}
            title={t('currentResponses')}
            description={t('loadingResponses')}
          />
          <SectionContent>
            <div className="space-y-6">
              {/* Date Results Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Participants Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                {Array.from({ length: 2 }, (_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 border border-gray-200">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </SectionContent>
        </SectionCard>
      </div>
    </div>
  );
}