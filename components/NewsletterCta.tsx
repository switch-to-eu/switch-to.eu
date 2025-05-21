"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { useTranslations, useLocale } from "next-intl";

const formSchema = z.object({
  firstname: z.string().min(1, {
    message: "Please enter your name",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export const NewsletterCta = () => {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      email: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Make API call to subscribe user to Mailcoach
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          first_name: data.firstname,
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to subscribe to newsletter"
        );
      }

      setIsSuccess(true);
      form.reset();
    } catch (error) {
      console.error("Error submitting newsletter form:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-[var(--green-bg)] p-4 sm:p-6 rounded-lg">
      <div className="w-40 h-40 sm:w-56 sm:h-56 relative flex-shrink-0 mr-6">
        <Image
          src="/images/categories/email.svg"
          alt="Newsletter illustration"
          fill
          className="object-contain p-4"
        />
      </div>
      <div className="flex-1">
        <h2 className="font-bold text-xl sm:text-2xl text-slate-800 mb-2 sm:mb-3">
          {t("title")}
        </h2>
        <p className="text-slate-700 mb-4 sm:mb-6">{t("description")}</p>

        {!isSuccess ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("firstNameLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          {...field}
                          className="h-12 px-4 bg-white border-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("emailLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john.doe@example.com"
                          {...field}
                          className="h-12 px-4 bg-white border-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <Button
                variant="cta"
                type="submit"
                disabled={isSubmitting}
                className="mt-4 h-12 px-6 text-base"
              >
                {isSubmitting ? "..." : t("submitLabel")}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="bg-white bg-opacity-50 p-4 rounded-md">
            <p className="text-slate-800 font-medium">{t("successMessage")}</p>
          </div>
        )}
      </div>
    </div>
  );
};
