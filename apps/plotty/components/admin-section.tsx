"use client";

import { useState, useCallback } from "react";
import {
  Copy,
  Check,
  Edit,
  Trash2,
  ExternalLink,
  Settings,
  Shield,
} from "lucide-react";

import { Button } from "@switch-to-eu/ui/components/button";
import { Label } from "@switch-to-eu/ui/components/label";
import { toast } from "sonner";
import { PollForm, type ProcessedPollFormData } from "./poll-form";
import type { DecryptedPoll } from "@/lib/interfaces";
import { generateAdminUrl } from "@/lib/admin";
import { SectionCard, SectionHeader, SectionContent } from "@switch-to-eu/blocks/components/section-card";
import { useRouter } from "@switch-to-eu/i18n/navigation";
import { useLocale } from "next-intl";

interface AdminSectionProps {
  poll: DecryptedPoll;
  pollId: string;
  adminToken: string;
  encryptionKey: string;
  onUpdatePoll: (formData: ProcessedPollFormData) => Promise<void>;
  onDeletePoll: () => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function AdminSection({
  poll,
  pollId,
  adminToken,
  encryptionKey,
  onUpdatePoll,
  onDeletePoll,
  isUpdating = false,
  isDeleting = false,
}: AdminSectionProps) {
  const locale = useLocale();
  const [isEditing, setIsEditing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const copyToClipboard = useCallback((text: string, type: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedUrl(type);
      toast.success(`${type} copied to clipboard!`);
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  }, []);

  const copyPollLink = useCallback(() => {
    const pollUrl = `${window.location.origin}/poll/${pollId}#${encryptionKey}`;
    copyToClipboard(pollUrl, "Poll link");
  }, [pollId, encryptionKey, copyToClipboard]);

  const copyAdminLink = useCallback(() => {
    const adminUrl = generateAdminUrl(pollId, adminToken, encryptionKey);
    copyToClipboard(adminUrl, "Admin link");
  }, [pollId, adminToken, encryptionKey, copyToClipboard]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleEditSubmit = useCallback(async (formData: ProcessedPollFormData) => {
    await onUpdatePoll(formData);
    setIsEditing(false);
    toast.success("Poll updated successfully!");
  }, [onUpdatePoll]);

  const handleDelete = useCallback(async () => {
    if (!confirm("Are you sure you want to delete this poll? This action cannot be undone.")) {
      return;
    }
    await onDeletePoll();
  }, [onDeletePoll]);

  const openParticipantView = useCallback(() => {
    window.open(`/${locale}/poll/${pollId}#${encryptionKey}`, "_blank");
  }, [pollId, encryptionKey, locale]);

  return (
    <>
      <SectionCard>
        <SectionHeader
          icon={<Settings className="h-5 w-5" />}
          title="Poll Management"
          description="Manage your poll settings and share with participants"
        />
        <SectionContent className="space-y-6">
          {/* Share Links */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Share with Participants
              </Label>
              <Button
                onClick={copyPollLink}
                variant="secondary"
                className="h-12 w-full justify-start"
              >
                {copiedUrl === "Poll link" ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                Copy Poll Link
              </Button>
              <p className="text-sm text-gray-600">
                Share this link so people can vote on your poll
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">
                Admin Access
              </Label>

              <Button
                onClick={copyAdminLink}
                variant="outline"
                className="h-12 w-full justify-start"
              >
                {copiedUrl === "Admin link" ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" />
                )}
                Copy Admin Link
              </Button>
              <p className="text-sm text-gray-600">
                Keep this link safe - it gives full control over the poll
              </p>
            </div>
          </div>

          {/* Poll Actions */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button
              onClick={startEditing}
              className="h-12 flex-1"
              disabled={isEditing || isUpdating}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Poll
            </Button>

            <Button
              onClick={openParticipantView}
              variant="secondary"
              className="h-12 flex-1"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View as Participant
            </Button>

            <Button
              onClick={handleDelete}
              variant="destructive"
              className="h-12 w-full sm:flex-1"
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </SectionContent>
      </SectionCard>

      {/* Edit Form */}
      {isEditing && (
        <SectionCard>
          <SectionHeader
            icon={<Edit className="h-5 w-5" />}
            title="Edit Poll"
            description="Update your poll details and available dates"
          />
          <SectionContent>
            <PollForm
              onSubmit={handleEditSubmit}
              onCancel={cancelEdit}
              isLoading={isUpdating}
              submitText="Save Changes"
              initialData={{
                title: poll.title,
                description: poll.description ?? "",
                location: poll.location ?? "",
                selectedDates: poll.dates.map(date => new Date(date)),
                expirationDays: 30, // Default for editing
                // Time selection fields
                enableTimeSelection: poll.allowHourSelection ?? false,
                fixedDuration: poll.fixedDuration,
                selectedStartTimes: poll.selectedStartTimes?.map(timeString => {
                  const [hourStr, minuteStr] = timeString.split(':');
                  const hour = parseInt(hourStr || '0', 10);
                  const minutes = parseInt(minuteStr || '0', 10);
                  return {
                    hour: isNaN(hour) ? 0 : Math.max(0, Math.min(23, hour)),
                    minutes: isNaN(minutes) ? 0 : Math.max(0, Math.min(59, minutes)),
                  };
                }) ?? [],
              }}
            />
          </SectionContent>
        </SectionCard>
      )}
    </>
  );
}