"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { PollForm, type ProcessedPollFormData } from "@components/poll-form";
import { generateEncryptionKey, encryptData } from "@switch-to-eu/db/crypto";
import type { EncryptedPollStructure } from "@/lib/interfaces";
import { toast } from "sonner";
import { calculateExpirationDate } from "@switch-to-eu/db/expiration";
import { api } from "@/lib/trpc-client";
import { LoadingButton } from "@switch-to-eu/ui/components/loading-button";
import { Checkbox } from "@switch-to-eu/ui/components/checkbox";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Users } from "lucide-react";
import { useRouter } from "@switch-to-eu/i18n/navigation";

export default function CreatePoll() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslations('CreatePage');

  // Use tRPC mutation
  const createPollMutation = api.poll.create.useMutation();

  const handlePollSubmit = async (formData: ProcessedPollFormData) => {
    setIsLoading(true);

    try {
      // Generate encryption key for E2EE
      const encryptionKey = await generateEncryptionKey();

      // Prepare poll structure for encryption (no participants — votes are stored separately)
      const pollDataToEncrypt: EncryptedPollStructure = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        dates: formData.selectedDates.map(date => date.toISOString().split("T")[0]!),
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

      const adminUrl = `/poll/${poll.id}/admin#token=${encodeURIComponent(adminToken)}&key=${encodeURIComponent(encryptionKey)}`;

      toast.success(t('successMessage'));
      router.push(adminUrl);
    } catch {
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
            disabled={!termsAccepted}
            submitText={t('submitText')}
            hideMobileSubmit={true}
            formRef={formRef}
          />

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <label htmlFor="terms" className="text-sm text-neutral-600 leading-tight cursor-pointer">
              {t.rich('termsLabel', {
                link: (chunks) => (
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500 underline" target="_blank">
                    {chunks}
                  </Link>
                ),
              })}
            </label>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 sm:hidden">
        <LoadingButton
          type="button"
          onClick={handleMobileSubmit}
          loading={isLoading}
          disabled={!termsAccepted}
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