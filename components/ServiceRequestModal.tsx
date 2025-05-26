"use client";

import { useState, useEffect } from "react";
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

// Define the validation schema for service requests
const serviceRequestSchema = z.object({
  title: z
    .string()
    .min(5, "Service name must be at least 5 characters")
    .refine((val) => !/[<>]/.test(val), "HTML tags are not allowed"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .refine((val) => !/[<>]/.test(val), "HTML tags are not allowed"),
  contactInfo: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  csrfToken: z.string(),
});

type ServiceRequestValues = z.infer<typeof serviceRequestSchema>;

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
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [issueUrl, setIssueUrl] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>("");

  // Generate a CSRF token
  useEffect(() => {
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    setCsrfToken(token);
    sessionStorage.setItem("csrfToken", token);
  }, []);

  const form = useForm<ServiceRequestValues>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      contactInfo: "",
      csrfToken: csrfToken,
    },
  });

  // Update the CSRF token in form values when it changes
  useEffect(() => {
    form.setValue("csrfToken", csrfToken);
  }, [csrfToken, form]);

  // Submit handler
  const onSubmit = async (data: ServiceRequestValues) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Verify the CSRF token matches what's in session storage
      const storedToken = sessionStorage.getItem("csrfToken");
      if (data.csrfToken !== storedToken) {
        throw new Error("CSRF token validation failed");
      }

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
      setIssueUrl(result.issueUrl);
      form.reset();

      // Generate a new CSRF token after successful submission
      const newToken =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      setCsrfToken(newToken);
      sessionStorage.setItem("csrfToken", newToken);
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
        <Button variant={variant}>{triggerText || t("cta")}</Button>
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

            {/* Hidden CSRF token field */}
            <input type="hidden" {...form.register("csrfToken")} />

            {submitStatus === "success" && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                  {t("serviceRequestSuccessMessage")}
                  {issueUrl && (
                    <div className="mt-2">
                      <a
                        href={issueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {t("serviceRequestViewIssue")}
                      </a>
                    </div>
                  )}
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
