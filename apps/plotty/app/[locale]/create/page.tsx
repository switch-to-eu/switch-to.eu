"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { PollForm, type ProcessedPollFormData } from "@components/poll-form";
import { generateEncryptionKey, encryptData } from "@/lib/crypto";
import { toast } from "sonner";
import { calculateExpirationDate } from "@/lib/expiration";
import { api } from "@/lib/trpc-client";
import { LoadingButton } from "@components/ui/loading-button";
import { Users } from "lucide-react";
import { useRouter } from "@switch-to-eu/i18n/navigation";

export default function CreatePoll() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslations('CreatePage');

  // Use tRPC mutation
  const createPollMutation = api.poll.create.useMutation();

  const handlePollSubmit = async (formData: ProcessedPollFormData) => {
    setIsLoading(true);

    try {
      // Generate encryption key for E2EE
      const encryptionKey = await generateEncryptionKey();

      // Prepare poll data for encryption (excluding expiresAt which stays unencrypted)
      const pollDataToEncrypt = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        dates: formData.selectedDates.map(date => date.toISOString().split("T")[0]!),
        participants: [], // Initialize empty participants array
        // Include new time selection fields
        fixedDuration: formData.fixedDuration,
        selectedStartTimes: formData.selectedStartTimes,
        allowHourSelection: formData.enableTimeSelection,
      };

      // Encrypt the poll data
      const encryptedData = await encryptData(pollDataToEncrypt, encryptionKey);

      // Prepare tRPC request with encrypted data
      const tRPCRequest = {
        encryptedData,
        expiresAt: calculateExpirationDate(new Date(), formData.expirationDays), // Send as Date object
      };

      // Create poll via tRPC
      const response = await createPollMutation.mutateAsync(tRPCRequest);

      const { poll, adminToken } = response;

      const adminUrl = `/poll/${poll.id}/admin/${adminToken}#${encryptionKey}`;

      toast.success(t('successMessage'));
      router.push(adminUrl);
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error(t('errorMessage'));
      setIsLoading(false);
    }
  };

  const handleMobileSubmit = () => {
    if (formRef.current) {
      // Trigger form submission programmatically
      formRef.current.requestSubmit();
    }
  };

  return (
    <>
      <div className="py-0 sm:py-4 lg:py-6">
        <div className="container mx-auto max-w-4xl space-y-8">
          <PollForm
            onSubmit={handlePollSubmit}
            isLoading={isLoading}
            submitText={t('submitText')}
            hideMobileSubmit={true}
            formRef={formRef}
          />
        </div>
      </div>

      {/* Mobile Sticky Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 sm:hidden">
        <LoadingButton
          type="button"
          onClick={handleMobileSubmit}
          loading={isLoading}
          loadingText={t('loadingText')}
          className="w-full"
        >
          <Users className="mr-2 h-5 w-5" />
          {t('submitText')}
        </LoadingButton>
      </div>

      {/* Add bottom padding on mobile to account for sticky footer */}
      <div className="h-20 sm:hidden" />
    </>
  );
}