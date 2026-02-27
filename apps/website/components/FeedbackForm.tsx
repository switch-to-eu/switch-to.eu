"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@switch-to-eu/ui/components/form";
import { Input } from "@switch-to-eu/ui/components/input";
import { Textarea } from "@switch-to-eu/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@switch-to-eu/ui/components/select";
import { Alert, AlertDescription } from "@switch-to-eu/ui/components/alert";
import { useMessages, useTranslations } from "next-intl";
import { Link } from "@switch-to-eu/i18n/navigation";

// Define a type for validation messages
type ValidationMessages = {
  titleMinLength: string;
  titleNoHtml: string;
  descriptionMinLength: string;
  descriptionNoHtml: string;
  categoryRequired: string;
  invalidEmail: string;
};

// Define the validation schema
const formSchema = (validationMessages: ValidationMessages) =>
  z.object({
    title: z
      .string()
      .min(5, {
        message: validationMessages.titleMinLength,
      })
      .refine((val) => !/[<>]/.test(val), {
        message: validationMessages.titleNoHtml,
      }),
    description: z
      .string()
      .min(10, {
        message: validationMessages.descriptionMinLength,
      })
      .refine((val) => !/[<>]/.test(val), {
        message: validationMessages.descriptionNoHtml,
      }),
    category: z.enum(["bug", "feature", "feedback", "new-service", "other"], {
      required_error: validationMessages.categoryRequired,
    }),
    contactInfo: z
      .string()
      .email({ message: validationMessages.invalidEmail })
      .optional()
      .or(z.literal("")),
  });

// Type for the form values
type FormValues = z.infer<ReturnType<typeof formSchema>>;

export default function FeedbackForm() {
  const t = useTranslations("feedback");
  const commonT = useTranslations("common");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [issueUrl, setIssueUrl] = useState<string | null>(null);

  const {
    feedback: {
      form: { validation },
    },
  } = useMessages();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema(validation as ValidationMessages)),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      contactInfo: "",
    },
  });

  // Submit handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/github/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as {
        error?: string;
        issueUrl?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to submit feedback");
      }

      setSubmitStatus("success");
      setIssueUrl(result.issueUrl ?? null);
      form.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-brand-sage/30 overflow-hidden">
      <div className="px-6 sm:px-8 pt-8 pb-2">
        <h2 className="font-heading text-2xl sm:text-3xl uppercase text-brand-green">
          {t("form.title")}
        </h2>
        <p className="text-brand-green/60 mt-2">{t("form.description")}</p>
      </div>
      <div className="px-6 sm:px-8 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-green font-semibold">
                    {t("form.categoryLabel")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-brand-sage/50 focus:ring-brand-green/20 focus:border-brand-green/50">
                        <SelectValue
                          placeholder={t("form.categoryPlaceholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bug">
                        {t("form.bugCategory")}
                      </SelectItem>
                      <SelectItem value="feature">
                        {t("form.featureCategory")}
                      </SelectItem>
                      <SelectItem value="feedback">
                        {t("form.feedbackCategory")}
                      </SelectItem>
                      <SelectItem value="new-service">
                        {t("form.newServiceCategory")}
                      </SelectItem>
                      <SelectItem value="other">
                        {t("form.otherCategory")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-green font-semibold">
                    {t("form.titleLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.titlePlaceholder")}
                      className="rounded-xl border-brand-sage/50 focus:ring-brand-green/20 focus:border-brand-green/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-green font-semibold">
                    {t("form.descriptionLabel")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("form.descriptionPlaceholder")}
                      className="min-h-[120px] rounded-xl border-brand-sage/50 focus:ring-brand-green/20 focus:border-brand-green/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-green font-semibold">
                    {t("form.contactInfoLabel")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.contactInfoPlaceholder")}
                      className="rounded-xl border-brand-sage/50 focus:ring-brand-green/20 focus:border-brand-green/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitStatus === "success" && (
              <Alert className="bg-brand-sage/30 text-brand-green border-brand-sage rounded-2xl">
                <AlertDescription>
                  {t("form.successMessage")}
                  {issueUrl && (
                    <div className="mt-2">
                      <a
                        href={issueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-navy hover:underline font-semibold"
                      >
                        {t("form.viewIssue")}
                      </a>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {submitStatus === "error" && (
              <Alert className="bg-brand-red/10 text-brand-red border-brand-red/20 rounded-2xl">
                <AlertDescription>{t("form.errorMessage")}</AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-brand-green/40">
              <p>
                {commonT("privacyNotice")}{" "}
                <Link
                  href="/privacy"
                  className="text-brand-navy hover:underline"
                >
                  {commonT("privacyPolicyLink")}
                </Link>
                .
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-brand-green text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 min-w-[140px]"
              >
                {isSubmitting ? t("form.submitting") : t("form.submitButton")}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
