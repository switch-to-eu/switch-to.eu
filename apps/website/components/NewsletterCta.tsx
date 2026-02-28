"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@switch-to-eu/ui/components/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@switch-to-eu/ui/components/form";

import { Input } from "@switch-to-eu/ui/components/input";
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

export const NewsletterCta = ({ contained = true }: { contained?: boolean }) => {
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
        const errorData = (await response.json()) as { message?: string };
        throw new Error(
          errorData.message ?? "Failed to subscribe to newsletter"
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
    <section>
      <div className={contained ? "container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8" : ""}>
        <div className="bg-brand-navy rounded-3xl">
          <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20 overflow-hidden">
            {/* Decorative shapes — same scale as Hero */}
            <div className="absolute -top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48 opacity-20 pointer-events-none">
              <Image
                src="/images/shapes/sunburst.svg"
                alt=""
                fill
                className="object-contain select-none animate-shape-float"
                style={{ filter: "brightness(0) invert(1)" }}
                aria-hidden="true"
                unoptimized
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 sm:w-52 sm:h-52 opacity-15 pointer-events-none">
              <Image
                src="/images/shapes/blob.svg"
                alt=""
                fill
                className="object-contain select-none animate-shape-float"
                style={{
                  filter: "brightness(0) invert(1)",
                  animationDelay: "-3s",
                }}
                aria-hidden="true"
                unoptimized
              />
            </div>
            <div className="absolute top-1/2 right-1/4 w-24 h-24 sm:w-36 sm:h-36 opacity-10 pointer-events-none -translate-y-1/2">
              <Image
                src="/images/shapes/spark.svg"
                alt=""
                fill
                className="object-contain select-none animate-shape-float"
                style={{
                  filter: "brightness(0) invert(1)",
                  animationDelay: "-5s",
                }}
                aria-hidden="true"
                unoptimized
              />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-2xl mx-auto text-center">
              <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow mb-4 sm:mb-6">
                {t("title")}
              </h2>
              <p className="text-brand-sky text-base sm:text-lg mb-8 sm:mb-10">
                {t("description")}
              </p>

              {!isSuccess ? (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstname"
                        render={({ field }) => (
                          <FormItem className="text-left">
                            <FormLabel className="text-brand-sky/80 text-sm">
                              {t("firstNameLabel")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John"
                                {...field}
                                className="h-12 px-5 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-full focus:border-brand-yellow focus:ring-brand-yellow"
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
                          <FormItem className="text-left">
                            <FormLabel className="text-brand-sky/80 text-sm">
                              {t("emailLabel")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="john.doe@example.com"
                                {...field}
                                className="h-12 px-5 bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-full focus:border-brand-yellow focus:ring-brand-yellow"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {error && (
                      <div className="bg-brand-red/20 text-brand-red p-3 rounded-full text-sm">
                        {error}
                      </div>
                    )}
                    <Button
                      variant="cta"
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 px-8 text-base bg-brand-yellow text-brand-navy hover:bg-brand-yellow/90 rounded-full font-semibold"
                    >
                      {isSubmitting ? "..." : t("submitLabel")}
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="bg-brand-green/30 p-6 rounded-3xl">
                  <p className="text-white text-lg font-medium">
                    {t("successMessage")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
