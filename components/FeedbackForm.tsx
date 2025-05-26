"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMessages, useTranslations } from "next-intl";

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
    category: z.enum(["bug", "feature", "feedback", "other"], {
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
    resolver: zodResolver(formSchema(validation)),
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit feedback");
      }

      setSubmitStatus("success");
      setIssueUrl(result.issueUrl);
      form.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t("form.title")}</CardTitle>
        <CardDescription>{t("form.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.titleLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.titlePlaceholder")}
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
                  <FormLabel>{t("form.descriptionLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("form.descriptionPlaceholder")}
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.categoryLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.contactInfoLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.contactInfoPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {submitStatus === "success" && (
              <Alert
                variant="default"
                className="bg-green-50 text-green-800 border-green-200"
              >
                <AlertDescription>
                  {t("form.successMessage")}
                  {issueUrl && (
                    <div className="mt-2">
                      <a
                        href={issueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {t("form.viewIssue")}
                      </a>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {submitStatus === "error" && (
              <Alert variant="destructive">
                <AlertDescription>{t("form.errorMessage")}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? t("form.submitting") : t("form.submitButton")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
