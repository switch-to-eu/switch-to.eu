"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Define a type for validation messages
type ValidationMessages = {
  titleMinLength: string;
  titleNoHtml: string;
  descriptionMinLength: string;
  descriptionNoHtml: string;
  invalidEmail: string;
};

// Define the validation schema factory function
const createServiceRequestSchema = (validationMessages: ValidationMessages) =>
  z.object({
    title: z
      .string()
      .min(5, validationMessages.titleMinLength)
      .refine((val) => !/[<>]/.test(val), validationMessages.titleNoHtml),
    description: z
      .string()
      .min(10, validationMessages.descriptionMinLength)
      .refine((val) => !/[<>]/.test(val), validationMessages.descriptionNoHtml),
    contactInfo: z
      .string()
      .email(validationMessages.invalidEmail)
      .optional()
      .or(z.literal("")),
  });

type ServiceRequestValues = z.infer<
  ReturnType<typeof createServiceRequestSchema>
>;

interface ServiceRequestModalProps {
  triggerText?: string;
  variant?:
  | "default"
  | "red"
  | "outline"
  | "ghost"
  | "link"
  | "destructive"
  | "secondary"
  | "search"
  | "cta";
}

export function ServiceRequestModal({
  triggerText,
  variant = "red",
}: ServiceRequestModalProps) {
  const t = useTranslations("contribute");
  const commonT = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const form = useForm<ServiceRequestValues>({
    resolver: zodResolver(
      createServiceRequestSchema({
        titleMinLength: t("validation.titleMinLength"),
        titleNoHtml: t("validation.titleNoHtml"),
        descriptionMinLength: t("validation.descriptionMinLength"),
        descriptionNoHtml: t("validation.descriptionNoHtml"),
        invalidEmail: t("validation.invalidEmail"),
      })
    ),
    defaultValues: {
      title: "",
      description: "",
      contactInfo: "",
    },
  });
  // Submit handler
  const onSubmit = async (data: ServiceRequestValues) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/github/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          category: "new-service", // Fixed category for service requests
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit service request");
      }

      setSubmitStatus("success");
      form.reset();
    } catch (error) {
      console.error("Error submitting service request:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant}>{triggerText || t("ctaButton")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("serviceRequestTitle")}</DialogTitle>
          <DialogDescription>
            {t("serviceRequestDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("serviceRequestNameLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("serviceRequestNamePlaceholder")}
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
                  <FormLabel>{t("serviceRequestDescriptionLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("serviceRequestDescriptionPlaceholder")}
                      className="min-h-[100px]"
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
                  <FormLabel>{t("serviceRequestContactLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("serviceRequestContactPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitStatus === "success" && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                  {t("serviceRequestSuccessMessage")}
                </AlertDescription>
              </Alert>
            )}

            {submitStatus === "error" && (
              <Alert variant="destructive">
                <AlertDescription>
                  {t("serviceRequestErrorMessage")}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-gray-400">
              <p>
                {commonT("privacyNotice")}{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  {commonT("privacyPolicyLink")}
                </Link>
                .
              </p>
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={form.handleSubmit(onSubmit)}
            className="min-w-[120px]"
          >
            {isSubmitting
              ? t("serviceRequestSubmitting")
              : t("serviceRequestSubmitButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
